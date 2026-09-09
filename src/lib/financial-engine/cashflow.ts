import { prisma } from "@/lib/prisma";

type CashflowPeriod = {
  startDate: Date;
  endDate: Date;
};

export async function getCashflow(
  userId: string,
  period: CashflowPeriod,
) {
  const [incomeResult, expenseResult] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          transactionDate: {
            gte: period.startDate,
            lt: period.endDate,
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
            gte: period.startDate,
            lt: period.endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

  const income =
    incomeResult._sum.amount ?? BigInt(0);

  const expense =
    expenseResult._sum.amount ?? BigInt(0);

  const netCashflow = income - expense;

  return {
    income,
    expense,
    netCashflow,
  };
}