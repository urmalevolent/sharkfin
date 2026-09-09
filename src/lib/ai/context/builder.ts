import { getFinancialOverview } from "@/services/financial-engine.service";
import { getUserInsights } from "@/services/insight.service";

import type {
  AIContext,
} from "./types";

type UserContext = {
  name: string;
};

function toNumber(
  value: string | number | bigint,
): number {
  return Number(value);
}

export async function buildAIContext(
  userId: string,
  user: UserContext,
): Promise<AIContext> {
  const [
    financialData,
    insightData,
  ] = await Promise.all([
    getFinancialOverview(userId),
    getUserInsights(userId),
  ]);

  const spendingCategories =
    financialData.spending.byCategory
      .map((category) => ({
        categoryName:
          category.categoryName,
        amount: toNumber(category.amount),
        percentage: category.percentage,
        transactionCount:
          category.transactionCount,
      }))
      .sort(
        (a, b) =>
          b.amount - a.amount,
      );

  const topCategories =
    spendingCategories.slice(0, 5);

  const goals =
    financialData.goals.goals.map(
      (goal) => ({
        name: goal.name,

        currentAmount:
          toNumber(
            goal.currentAmount,
          ),

        targetAmount:
          toNumber(
            goal.targetAmount,
          ),

        remaining:
          toNumber(
            goal.remaining,
          ),

        progress:
          goal.progress,

        deadline:
          goal.deadline
            ? goal.deadline.toISOString()
            : null,

        requiredMonthlySaving:
          toNumber(
            goal.requiredMonthlySaving,
          ),

        completed:
          goal.completed,
      }),
    );

  const budgets =
    financialData.budget.budgets.map(
      (budget) => ({
        categoryName:
          budget.categoryName,

        budgetAmount:
          toNumber(
            budget.budgetAmount,
          ),

        spent:
          toNumber(
            budget.spent,
          ),

        remaining:
          toNumber(
            budget.remaining,
          ),

        usage:
          budget.usage,

        status:
          budget.status,
      }),
    );

  const upcoming =
    financialData.obligations.obligations.map(
      (obligation) => ({
        name: obligation.name,

        amount:
          toNumber(
            obligation.amount,
          ),

        nextDate:
          obligation.nextDate.toISOString(),
      }),
    );

  const insights =
    insightData.insights.map(
      (insight) => ({
        type: insight.type,

        severity:
          insight.severity,

        title:
          insight.title,

        message:
          insight.message,

        priority:
          insight.priority,
      }),
    );

  return {
    generatedAt:
      new Date().toISOString(),

    user: {
      name: user.name,
    },

    balance: {
      total:
        toNumber(
          financialData.balance.total,
        ),
    },

    cashflow: {
      income:
        toNumber(
          financialData.cashflow.income,
        ),

      expense:
        toNumber(
          financialData.cashflow.expense,
        ),

      netCashflow:
        toNumber(
          financialData.cashflow.netCashflow,
        ),

      savingRate:
        financialData.cashflow.savingRate,
    },

    spending: {
      total:
        toNumber(
          financialData.spending.total,
        ),

      averageDaily:
        toNumber(
          financialData.spending.averageDaily,
        ),

      transactionCount:
        financialData.spending
          .transactionCount,

      topCategories,

      trend: {
        current:
          toNumber(
            financialData.spending.trend
              .current,
          ),

        previous:
          toNumber(
            financialData.spending.trend
              .previous,
          ),

        changePercentage:
          financialData.spending.trend
            .changePercentage,

        direction:
          financialData.spending.trend
            .direction,
      },
    },

    budget: {
      totalBudget:
        toNumber(
          financialData.budget
            .totalBudget,
        ),

      totalSpent:
        toNumber(
          financialData.budget
            .totalSpent,
        ),

      totalRemaining:
        toNumber(
          financialData.budget
            .totalRemaining,
        ),

      budgetCount:
        financialData.budget
          .budgetCount,

      highestUsage:
        financialData.budget
          .highestUsage,

      budgets,
    },

    goals: {
      totalGoals:
        financialData.goals
          .totalGoals,

      activeGoals:
        financialData.goals
          .activeGoals,

      completedGoals:
        financialData.goals
          .completedGoals,

      goals,
    },

    obligations: {
      totalUpcoming:
        toNumber(
          financialData.obligations
            .totalUpcoming,
        ),

      availableBalance:
        toNumber(
          financialData.obligations
            .availableBalance,
        ),

      obligationCount:
        financialData.obligations
          .obligationCount,

      upcoming,
    },

    forecast: {
      currentBalance:
        toNumber(
          financialData.forecast
            .currentBalance,
        ),

      upcomingObligations:
        toNumber(
          financialData.forecast
            .upcomingObligations,
        ),

      availableBalance:
        toNumber(
          financialData.forecast
            .availableBalance,
        ),

      spending:
        toNumber(
          financialData.forecast
            .spending,
        ),

      elapsedDays:
        financialData.forecast
          .elapsedDays,

      remainingDays:
        financialData.forecast
          .remainingDays,

      averageDailySpending:
        toNumber(
          financialData.forecast
            .averageDailySpending,
        ),

      projectedRemainingSpending:
        toNumber(
          financialData.forecast
            .projectedRemainingSpending,
        ),

      estimatedEndBalance:
        toNumber(
          financialData.forecast
            .estimatedEndBalance,
        ),
    },

    financialHealth: {
  overallStatus:
    financialData.financialHealth
      .overallStatus,

  cashflow: {
    income:
      toNumber(
        financialData.financialHealth
          .cashflow.income,
      ),

    expense:
      toNumber(
        financialData.financialHealth
          .cashflow.expense,
      ),

    netCashflow:
      toNumber(
        financialData.financialHealth
          .cashflow.netCashflow,
      ),

    savingRate:
      financialData.financialHealth
        .cashflow.savingRate,

    status:
      financialData.financialHealth
        .cashflow.status,
  },

  saving: {
    savingRate:
      financialData.financialHealth
        .saving.savingRate,

    status:
      financialData.financialHealth
        .saving.status,
  },

  budget: {
    budgetCount:
      financialData.financialHealth
        .budget.budgetCount,

    highestUsage:
      financialData.financialHealth
        .budget.highestUsage
        ? {
            categoryId:
              financialData.financialHealth
                .budget.highestUsage
                .categoryId,

            usage:
              financialData.financialHealth
                .budget.highestUsage
                .usage,

            status:
              financialData.financialHealth
                .budget.highestUsage
                .status,
          }
        : null,

    status:
      financialData.financialHealth
        .budget.status,
  },

  goals: {
    totalGoals:
      financialData.financialHealth
        .goals.totalGoals,

    goalsNeedingAttention:
      financialData.financialHealth
        .goals.goalsNeedingAttention,

    status:
      financialData.financialHealth
        .goals.status as
        | "GOOD"
        | "WATCH"
        | "WARNING",
  },

  obligations: {
    totalUpcoming:
      toNumber(
        financialData.financialHealth
          .obligations.totalUpcoming,
      ),

    availableBalance:
      toNumber(
        financialData.financialHealth
          .obligations.availableBalance,
      ),

    status:
      financialData.financialHealth
        .obligations.status,
  },
},

    insights,
  };
}