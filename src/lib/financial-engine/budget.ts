import { prisma } from "@/lib/prisma";

export async function getBudgetMetrics(
  userId: string,
) {
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

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month,
      year,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
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

  const metrics = budgets.map((budget) => {
    const spent =
      spentMap.get(budget.categoryId) ??
      BigInt(0);

    const remaining =
      budget.amount - spent;

    const usage =
      budget.amount > BigInt(0)
        ? Number(
            (
              (Number(spent) /
                Number(budget.amount)) *
              100
            ).toFixed(2),
          )
        : 0;

    let status:
      | "NORMAL"
      | "WATCH"
      | "WARNING"
      | "EXCEEDED";

    if (usage >= 100) {
      status = "EXCEEDED";
    } else if (usage >= 85) {
      status = "WARNING";
    } else if (usage >= 70) {
      status = "WATCH";
    } else {
      status = "NORMAL";
    }

    return {
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: budget.category.name,

      budgetAmount: budget.amount,
      spent,
      remaining,

      usage,
      status,
    };
  });

  const totalBudget = metrics.reduce(
    (total, item) =>
      total + item.budgetAmount,
    BigInt(0),
  );

  const totalSpent = metrics.reduce(
    (total, item) =>
      total + item.spent,
    BigInt(0),
  );

  const totalRemaining =
    totalBudget - totalSpent;

  const highestUsage =
    metrics.length > 0
      ? metrics.reduce((highest, item) =>
          item.usage > highest.usage
            ? item
            : highest,
        )
      : null;

  return {
    month,
    year,

    totalBudget,
    totalSpent,
    totalRemaining,

    budgetCount: metrics.length,

    highestUsage: highestUsage
      ? {
          categoryId:
            highestUsage.categoryId,
          categoryName:
            highestUsage.categoryName,
          usage:
            highestUsage.usage,
          status:
            highestUsage.status,
        }
      : null,

    budgets: metrics,
  };
}