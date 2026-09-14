import {
  getBudgetMetrics,
  getCashflow,
  getForecastMetrics,
  getGoalMetrics,
  getObligationMetrics,
  getSpending,
  getSpendingTrend,
  getTotalBalance,
  getFinancialHealth,
  calculateAffordability,
} from "@/lib/financial-engine";

function getCurrentMonthPeriod() {
  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  return {
    startDate,
    endDate,
  };
}

export async function getFinancialOverview(
  userId: string,
) {
  const period =
    getCurrentMonthPeriod();

  const [
    totalBalance,
    cashflow,
    spending,
    spendingTrend,
    budget,
    goals,
    obligations,
    forecast,
    financialHealth,
  ] = await Promise.all([
    getTotalBalance(userId),
    getCashflow(userId, period),
    getSpending(userId, period),
    getSpendingTrend(userId),
    getBudgetMetrics(userId),
    getGoalMetrics(userId),
    getObligationMetrics(userId),
    getForecastMetrics(
      userId,
      period,
    ),
    getFinancialHealth(userId),
  ]);

  const savingRate =
    cashflow.income > BigInt(0)
      ? Number(
          (
            (Number(
              cashflow.netCashflow,
            ) /
              Number(
                cashflow.income,
              )) *
            100
          ).toFixed(2),
        )
      : null;

  return {
    period: {
      startDate:
        period.startDate,

      endDate:
        period.endDate,
    },

    balance: {
      total:
        totalBalance,
    },

    cashflow: {
      income:
        cashflow.income,

      expense:
        cashflow.expense,

      netCashflow:
        cashflow.netCashflow,

      savingRate,
    },

    spending: {
      total:
        spending.totalSpending,

      transactionCount:
        spending.transactionCount,

      averageDaily:
        spending.averageDailySpending,

      elapsedDays:
        spending.elapsedDays,

      byCategory:
        spending.byCategory,

      trend: {
        current:
          spendingTrend.currentSpending,

        previous:
          spendingTrend.previousSpending,

        changePercentage:
          spendingTrend.changePercentage,

        direction:
          spendingTrend.direction,
      },
    },

    budget: {
      month:
        budget.month,

      year:
        budget.year,

      totalBudget:
        budget.totalBudget,

      totalSpent:
        budget.totalSpent,

      totalRemaining:
        budget.totalRemaining,

      budgetCount:
        budget.budgetCount,

      highestUsage:
        budget.highestUsage,

      budgets:
        budget.budgets,
    },

    goals: {
      totalGoals:
        goals.totalGoals,

      activeGoals:
        goals.activeGoals,

      completedGoals:
        goals.completedGoals,

      nearestDeadline:
        goals.nearestDeadline,

      goals:
        goals.goals,
    },

    obligations: {
      totalUpcoming:
        obligations.totalUpcoming,

      availableBalance:
        obligations.availableBalance,

      obligationCount:
        obligations.obligationCount,

      nearestObligation:
        obligations.nearestObligation,

      obligations:
        obligations.obligations,
    },

    forecast: {
      currentBalance:
        forecast.currentBalance,

      upcomingObligations:
        forecast.upcomingObligations,

      availableBalance:
        forecast.availableBalance,

      spending:
        forecast.spending,

      elapsedDays:
        forecast.elapsedDays,

      remainingDays:
        forecast.remainingDays,

      averageDailySpending:
        forecast.averageDailySpending,

      projectedRemainingSpending:
        forecast.projectedRemainingSpending,

      estimatedEndBalance:
        forecast.estimatedEndBalance,
    },

    financialHealth: {
      overallStatus:
        financialHealth.overallStatus,

      cashflow:
        financialHealth.cashflow,

      saving:
        financialHealth.saving,

      budget:
        financialHealth.budget,

      goals:
        financialHealth.goals,

      obligations:
        financialHealth.obligations,
    },
  };
}

/**
 * Analyze whether a requested purchase
 * is financially reasonable for the user.
 *
 * This calculation is deterministic.
 * It does not use the LLM.
 */
export async function getAffordabilityAnalysis(
  userId: string,
  purchaseAmount: bigint,
) {
  if (purchaseAmount <= BigInt(0)) {
    throw new Error(
      "Nominal pembelian harus lebih besar dari 0.",
    );
  }

  const period =
    getCurrentMonthPeriod();

  const [
    totalBalance,
    obligations,
    forecast,
    goals,
  ] = await Promise.all([
    getTotalBalance(userId),

    getObligationMetrics(userId),

    getForecastMetrics(
      userId,
      period,
    ),

    getGoalMetrics(userId),
  ]);

  /*
   * Forecast already calculates projected
   * spending based on the user's spending pattern.
   *
   * Therefore we reuse it instead of creating
   * another spending prediction system.
   */
  const expectedSpending =
    forecast.projectedRemainingSpending;

  /*
   * Calculate the monthly saving commitment
   * required by active goals.
   *
   * The entire remaining goal amount is NOT
   * treated as an obligation.
   */
  const goalCommitment =
    goals.goals.reduce(
      (
        total: bigint,
        goal,
      ) => {
        if (
          goal.completed ||
          goal.requiredMonthlySaving <=
            BigInt(0)
        ) {
          return total;
        }

        return (
          total +
          goal.requiredMonthlySaving
        );
      },
      BigInt(0),
    );

  const affordability =
    calculateAffordability({
      totalBalance,

      upcomingObligations:
        obligations.totalUpcoming,

      expectedSpending,

      purchaseAmount,

      goalCommitment,
    });

  return {
    ...affordability,

    forecast: {
      estimatedEndBalance:
        forecast.estimatedEndBalance,

      averageDailySpending:
        forecast.averageDailySpending,

      projectedRemainingSpending:
        forecast.projectedRemainingSpending,

      remainingDays:
        forecast.remainingDays,
    },

    goals: goals.goals.map(
      (goal) => ({
        id: goal.id,

        name: goal.name,

        targetAmount:
          goal.targetAmount,

        currentAmount:
          goal.currentAmount,

        remaining:
          goal.remaining,

        progress:
          goal.progress,

        requiredMonthlySaving:
          goal.requiredMonthlySaving,

        completed:
          goal.completed,
      }),
    ),
  };
}