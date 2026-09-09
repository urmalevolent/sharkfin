import type {
  Insight,
} from "./types";

type FinancialOverview = {
  cashflow: {
    income: string | number | bigint;
    expense: string | number | bigint;
    netCashflow: string | number | bigint;
    savingRate: number | null;
  };

  spending: {
    total: string | number | bigint;

    trend: {
      current: string | number | bigint;
      previous: string | number | bigint;
      changePercentage: number | null;
      direction:
        | "NO_DATA"
        | "UP"
        | "DOWN"
        | "UNCHANGED";
    };
  };

  budget: {
    budgets: Array<{
      id: string;
      categoryName: string;
      budgetAmount:
        | string
        | number
        | bigint;
      spent:
        | string
        | number
        | bigint;
      remaining:
        | string
        | number
        | bigint;
      usage: number;
      status:
        | "NORMAL"
        | "WATCH"
        | "WARNING"
        | "EXCEEDED";
    }>;
  };

  goals: {
    goals: Array<{
      id: string;
      name: string;
      currentAmount:
        | string
        | number
        | bigint;
      targetAmount:
        | string
        | number
        | bigint;
      progress: number;

      /*
       * Financial Engine mengembalikan
       * deadline sebagai Date | null.
       */
      deadline: Date | null;

      requiredMonthlySaving:
        | string
        | number
        | bigint;

      completed: boolean;
    }>;
  };

  obligations: {
    totalUpcoming:
      | string
      | number
      | bigint;

    availableBalance:
      | string
      | number
      | bigint;

    obligations: Array<{
      id: string;
      name: string;
      amount:
        | string
        | number
        | bigint;

      /*
       * Financial Engine mengembalikan
       * nextDate sebagai Date.
       */
      nextDate: Date;
    }>;
  };
};

function toNumber(
  value: string | number | bigint,
): number {
  return Number(value);
}

export function generateInsightTriggers(
  financialData: FinancialOverview,
): Insight[] {
  const insights: Insight[] = [];

  /*
   * ==========================================
   * 1. NEGATIVE AVAILABLE BALANCE
   * ==========================================
   */

  const availableBalance = toNumber(
    financialData.obligations.availableBalance,
  );

  if (availableBalance < 0) {
    insights.push({
      type: "NEGATIVE_AVAILABLE_BALANCE",
      severity: "CRITICAL",
      title: "Available Balance negatif",
      message:
        "Kewajiban terjadwalmu lebih besar daripada saldo yang tersedia. Sebaiknya prioritaskan kewajiban terdekat.",
      metadata: {
        availableBalance,
      },
    });
  }

  /*
   * ==========================================
   * 2. NEGATIVE CASHFLOW
   * ==========================================
   */

  const netCashflow = toNumber(
    financialData.cashflow.netCashflow,
  );

  if (netCashflow < 0) {
    insights.push({
      type: "NEGATIVE_CASHFLOW",
      severity: "WARNING",
      title: "Cashflow negatif",
      message:
        "Pengeluaranmu bulan ini lebih besar daripada pemasukan. Perhatikan pengeluaran sampai akhir periode.",
      metadata: {
        netCashflow,
      },
    });
  }

  /*
   * ==========================================
   * 3. BUDGET
   * ==========================================
   */

  for (
    const budget of financialData.budget.budgets
  ) {
    /*
     * Budget sudah terlampaui.
     */
    if (budget.usage >= 100) {
      insights.push({
        type: "BUDGET_EXCEEDED",
        severity: "CRITICAL",
        title:
          `Budget ${budget.categoryName} terlampaui`,
        message:
          `Penggunaan budget ${budget.categoryName} sudah mencapai ${budget.usage}%.`,
        metadata: {
          budgetId: budget.id,
          categoryName:
            budget.categoryName,
          usage: budget.usage,
          budgetAmount:
            budget.budgetAmount,
          spent: budget.spent,
        },
      });

      continue;
    }

    /*
     * Budget sudah mencapai 80%
     * tetapi belum melewati 100%.
     */
    if (budget.usage >= 80) {
      insights.push({
        type: "BUDGET_WARNING",
        severity: "WARNING",
        title:
          `Budget ${budget.categoryName} hampir habis`,
        message:
          `Budget ${budget.categoryName} sudah digunakan ${budget.usage}%.`,
        metadata: {
          budgetId: budget.id,
          categoryName:
            budget.categoryName,
          usage: budget.usage,
          budgetAmount:
            budget.budgetAmount,
          spent: budget.spent,
          remaining:
            budget.remaining,
        },
      });
    }
  }

  /*
   * ==========================================
   * 4. SPENDING SPIKE
   * ==========================================
   */

  const spendingTrend =
    financialData.spending.trend;

  if (
    spendingTrend.direction === "UP" &&
    spendingTrend.changePercentage !== null &&
    spendingTrend.changePercentage >= 20
  ) {
    insights.push({
      type: "SPENDING_SPIKE",
      severity: "WARNING",
      title: "Pengeluaran meningkat",
      message:
        `Pengeluaranmu meningkat ${spendingTrend.changePercentage}% dibanding bulan sebelumnya.`,
      metadata: {
        changePercentage:
          spendingTrend.changePercentage,

        currentSpending:
          spendingTrend.current,

        previousSpending:
          spendingTrend.previous,
      },
    });
  }

  /*
   * ==========================================
   * 5. UPCOMING EXPENSE
   * ==========================================
   */

  const now = new Date();

  for (
    const obligation of
      financialData.obligations.obligations
  ) {
    /*
     * nextDate sekarang bertipe Date,
     * sehingga tidak perlu parsing ulang
     * menggunakan new Date().
     */
    const nextDate =
      obligation.nextDate;

    const difference =
      nextDate.getTime() -
      now.getTime();

    const daysUntil = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24),
    );

    /*
     * Trigger ketika kewajiban akan
     * jatuh tempo dalam 0-3 hari.
     */
    if (
      daysUntil >= 0 &&
      daysUntil <= 3
    ) {
      insights.push({
        type: "UPCOMING_EXPENSE",
        severity: "INFO",
        title:
          "Pengeluaran akan datang",
        message:
          `${obligation.name} sebesar ${obligation.amount.toString()} akan jatuh tempo dalam ${daysUntil} hari.`,
        metadata: {
          obligationId:
            obligation.id,

          name:
            obligation.name,

          amount:
            obligation.amount,

          nextDate:
            obligation.nextDate,

          daysUntil,
        },
      });
    }
  }

  /*
   * ==========================================
   * 6. GOAL BEHIND
   * ==========================================
   */

  for (
    const goal of financialData.goals.goals
  ) {
    /*
     * Goal dianggap perlu diperhatikan
     * apabila:
     *
     * - belum selesai
     * - memiliki deadline
     * - progress masih di bawah 25%
     */
    if (
      !goal.completed &&
      goal.deadline &&
      goal.progress < 25
    ) {
      insights.push({
        type: "GOAL_BEHIND",
        severity: "WARNING",
        title:
          `Goal ${goal.name} perlu diperhatikan`,
        message:
          `Progress goal ${goal.name} saat ini baru ${goal.progress}%.`,
        metadata: {
          goalId:
            goal.id,

          goalName:
            goal.name,

          progress:
            goal.progress,

          deadline:
            goal.deadline,

          requiredMonthlySaving:
            goal.requiredMonthlySaving,
        },
      });
    }
  }

  return insights;
}