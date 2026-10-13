import { prisma } from "@/lib/prisma";

type HealthStatus =
  | "GOOD"
  | "WATCH"
  | "WARNING";

function getBudgetStatus(
  usage: number,
): HealthStatus {
  if (usage >= 100) {
    return "WARNING";
  }

  if (usage >= 85) {
    return "WATCH";
  }

  return "GOOD";
}

function getCashflowStatus(
  netCashflow: bigint,
): HealthStatus {
  if (netCashflow < BigInt(0)) {
    return "WARNING";
  }

  if (netCashflow === BigInt(0)) {
    return "WATCH";
  }

  return "GOOD";
}

function getSavingStatus(
  savingRate: number | null,
): HealthStatus {
  if (savingRate === null) {
    return "WATCH";
  }

  if (savingRate < 0) {
    return "WARNING";
  }

  if (savingRate < 10) {
    return "WATCH";
  }

  return "GOOD";
}

function getGoalStatus(
  progress: number,
): HealthStatus {
  if (progress < 25) {
    return "WARNING";
  }

  if (progress < 50) {
    return "WATCH";
  }

  return "GOOD";
}

function getObligationStatus(
  availableBalance: bigint,
  totalBalance: bigint,
): HealthStatus {
  if (totalBalance <= BigInt(0)) {
    return "WARNING";
  }

  if (availableBalance < BigInt(0)) {
    return "WARNING";
  }

  const availablePercentage =
    Number(
      (Number(availableBalance) /
        Number(totalBalance)) *
        100,
    );

  if (availablePercentage < 20) {
    return "WATCH";
  }

  return "GOOD";
}

export type FinancialHealthPrefetchedInput = {
  cashflow: {
    income: bigint;
    expense: bigint;
    netCashflow: bigint;
  };
  totalBalance: bigint;
  budget: {
    budgets: Array<{
      categoryId: string;
      usage: number;
    }>;
  };
  goals: {
    goals: Array<{
      id: string;
      name: string;
      targetAmount: bigint;
      currentAmount: bigint;
      progress: number;
    }>;
  };
  obligations: {
    totalUpcoming: bigint;
  };
};

export async function getFinancialHealth(
  userId: string,
  prefetched?: FinancialHealthPrefetchedInput,
) {
  if (prefetched) {
    const { income, expense, netCashflow } = prefetched.cashflow;
    const savingRate =
      income > BigInt(0)
        ? Number(
            (
              (Number(netCashflow) / Number(income)) *
              100
            ).toFixed(2),
          )
        : null;

    const budgetMetrics = prefetched.budget.budgets.map((budget) => ({
      categoryId: budget.categoryId,
      usage: budget.usage,
      status: getBudgetStatus(budget.usage),
    }));

    const highestBudgetUsage =
      budgetMetrics.length > 0
        ? budgetMetrics.reduce((highest, current) =>
            current.usage > highest.usage ? current : highest,
          )
        : null;

    const goalMetrics = prefetched.goals.goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      progress: goal.progress,
      status:
        goal.targetAmount <= goal.currentAmount
          ? ("GOOD" as HealthStatus)
          : getGoalStatus(goal.progress),
    }));

    const activeGoals = goalMetrics.filter(
      (goal) => goal.status !== "GOOD",
    );

    const totalBalance = prefetched.totalBalance;
    const upcomingObligations = prefetched.obligations.totalUpcoming;
    const availableBalance =
      totalBalance - upcomingObligations;

    const cashflowStatus = getCashflowStatus(netCashflow);
    const savingStatus = getSavingStatus(savingRate);
    const budgetStatus =
      highestBudgetUsage?.status ?? "GOOD";
    const goalStatus =
      activeGoals.some((goal) => goal.status === "WARNING")
        ? "WARNING"
        : activeGoals.length > 0
          ? "WATCH"
          : "GOOD";
    const obligationStatus = getObligationStatus(
      availableBalance,
      totalBalance,
    );

    const statuses = [
      cashflowStatus,
      savingStatus,
      budgetStatus,
      goalStatus,
      obligationStatus,
    ];

    let overallStatus: "GOOD" | "WATCH" | "WARNING" = "GOOD";

    if (statuses.includes("WARNING")) {
      overallStatus = "WARNING";
    } else if (statuses.includes("WATCH")) {
      overallStatus = "WATCH";
    }

    return {
      overallStatus,
      cashflow: {
        income,
        expense,
        netCashflow,
        savingRate,
        status: cashflowStatus,
      },
      saving: {
        savingRate,
        status: savingStatus,
      },
      budget: {
        budgetCount: budgetMetrics.length,
        highestUsage: highestBudgetUsage,
        status: budgetStatus,
      },
      goals: {
        totalGoals: goalMetrics.length,
        goalsNeedingAttention: activeGoals.length,
        status: goalStatus,
      },
      obligations: {
        totalUpcoming: upcomingObligations,
        availableBalance,
        status: obligationStatus,
      },
    };
  }

  const now = new Date();

  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const startDate = new Date(
    year,
    month - 1,
    1,
  );

  const endDate = new Date(
    year,
    month,
    1,
  );

  /*
   * CASHFLOW
   */
  const [
    incomeResult,
    expenseResult,
    balanceResult,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "INCOME",
        transactionDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.wallet.aggregate({
      where: {
        userId,
        isActive: true,
      },
      _sum: {
        balance: true,
      },
    }),
  ]);

  const income =
    incomeResult._sum.amount ??
    BigInt(0);

  const expense =
    expenseResult._sum.amount ??
    BigInt(0);

  const totalBalance =
    balanceResult._sum.balance ??
    BigInt(0);

  const netCashflow =
    income - expense;

  const savingRate =
    income > BigInt(0)
      ? Number(
          (
            (Number(netCashflow) /
              Number(income)) *
            100
          ).toFixed(2),
        )
      : null;

  /*
   * BUDGET (optimized with groupBy)
   */
  const budgets =
    await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
    });

  const categoryIds = budgets.map((b) => b.categoryId);

  const spentGrouped =
    categoryIds.length > 0
      ? await prisma.transaction.groupBy({
          by: ["categoryId"],
          where: {
            userId,
            type: "EXPENSE",
            categoryId: {
              in: categoryIds,
            },
            transactionDate: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        })
      : [];

  const spentMap = new Map<string, bigint>();
  for (const item of spentGrouped) {
    if (item.categoryId) {
      spentMap.set(
        item.categoryId,
        item._sum.amount ?? BigInt(0),
      );
    }
  }

  const budgetMetrics = budgets.map((budget) => {
    const spent =
      spentMap.get(budget.categoryId) ??
      BigInt(0);

    const usage =
      budget.amount > BigInt(0)
        ? Number(
            (
              (Number(spent) /
                Number(
                  budget.amount,
                )) *
              100
            ).toFixed(2),
          )
        : 0;

    return {
      categoryId:
        budget.categoryId,
      usage,
      status:
        getBudgetStatus(usage),
    };
  });

  const highestBudgetUsage =
    budgetMetrics.length > 0
      ? budgetMetrics.reduce(
          (highest, current) =>
            current.usage >
            highest.usage
              ? current
              : highest,
        )
      : null;

  /*
   * GOALS
   */
  const goals =
    await prisma.goal.findMany({
      where: {
        userId,
      },
      include: {
        wallet: {
          select: {
            balance: true,
          },
        },
      },
    });

  const goalMetrics = goals.map(
    (goal) => {
      const currentAmount =
        goal.wallet?.balance ??
        BigInt(0);

      const progress =
        goal.targetAmount >
        BigInt(0)
          ? Math.min(
              100,
              Number(
                (
                  (Number(
                    currentAmount,
                  ) /
                    Number(
                      goal.targetAmount,
                    )) *
                  100
                ).toFixed(2),
              ),
            )
          : 0;

      return {
        id: goal.id,
        name: goal.name,
        progress,
        status:
          goal.targetAmount <=
          currentAmount
            ? "GOOD"
            : getGoalStatus(progress),
      };
    },
  );

  const activeGoals =
    goalMetrics.filter(
      (goal) =>
        goal.status !== "GOOD",
    );

  /*
   * UPCOMING OBLIGATIONS
   */
  const scheduledExpenses =
    await prisma.scheduledExpense.findMany({
      where: {
        userId,
        isActive: true,
        status: "PENDING",
        nextDate: {
          gte: now,
        },
      },
      select: {
        amount: true,
      },
    });

  const upcomingObligations =
    scheduledExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      BigInt(0),
    );

  const availableBalance =
    totalBalance -
    upcomingObligations;

  /*
   * HEALTH STATUS
   */
  const cashflowStatus =
    getCashflowStatus(
      netCashflow,
    );

  const savingStatus =
    getSavingStatus(
      savingRate,
    );

  const budgetStatus =
    highestBudgetUsage?.status ??
    "GOOD";

  const goalStatus =
    activeGoals.some(
      (goal) =>
        goal.status === "WARNING",
    )
      ? "WARNING"
      : activeGoals.length > 0
        ? "WATCH"
        : "GOOD";

  const obligationStatus =
    getObligationStatus(
      availableBalance,
      totalBalance,
    );

  const statuses = [
    cashflowStatus,
    savingStatus,
    budgetStatus,
    goalStatus,
    obligationStatus,
  ];

  let overallStatus:
    | "GOOD"
    | "WATCH"
    | "WARNING" = "GOOD";

  if (
    statuses.includes("WARNING")
  ) {
    overallStatus = "WARNING";
  } else if (
    statuses.includes("WATCH")
  ) {
    overallStatus = "WATCH";
  }

  return {
    overallStatus,

    cashflow: {
      income,
      expense,
      netCashflow,
      savingRate,
      status: cashflowStatus,
    },

    saving: {
      savingRate,
      status: savingStatus,
    },

    budget: {
      budgetCount:
        budgetMetrics.length,
      highestUsage:
        highestBudgetUsage,
      status: budgetStatus,
    },

    goals: {
      totalGoals:
        goalMetrics.length,
      goalsNeedingAttention:
        activeGoals.length,
      status: goalStatus,
    },

    obligations: {
      totalUpcoming:
        upcomingObligations,
      availableBalance,
      status:
        obligationStatus,
    },
  };
}