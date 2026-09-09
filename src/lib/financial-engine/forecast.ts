import { prisma } from "@/lib/prisma";

type ForecastPeriod = {
  startDate: Date;
  endDate: Date;
};

export async function getForecastMetrics(
  userId: string,
  period: ForecastPeriod,
) {
  const now = new Date();

  /*
   * Current total balance dari seluruh
   * active wallet user.
   */
  const balanceResult =
    await prisma.wallet.aggregate({
      where: {
        userId,
        isActive: true,
      },
      _sum: {
        balance: true,
      },
    });

  const currentBalance =
    balanceResult._sum.balance ??
    BigInt(0);

  /*
   * Upcoming obligations yang sudah
   * diketahui sistem.
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
        nextDate: true,
      },
    });

  const upcomingObligations =
    scheduledExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      BigInt(0),
    );

  /*
   * Hitung pengeluaran pada periode
   * berjalan.
   */
  const expenseResult =
    await prisma.transaction.aggregate({
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
    });

  const spending =
    expenseResult._sum.amount ??
    BigInt(0);

  /*
   * Hitung jumlah hari yang sudah
   * berjalan pada periode.
   */
  const periodStart =
    period.startDate.getTime();

  const periodEnd =
    period.endDate.getTime();

  const periodDurationDays =
    Math.max(
      1,
      Math.ceil(
        (periodEnd - periodStart) /
          (1000 * 60 * 60 * 24),
      ),
    );

  const isCurrentPeriod =
    now >= period.startDate &&
    now < period.endDate;

  let elapsedDays =
    periodDurationDays;

  if (isCurrentPeriod) {
    elapsedDays = Math.max(
      1,
      Math.ceil(
        (now.getTime() -
          periodStart) /
          (1000 * 60 * 60 * 24),
      ),
    );
  }

  /*
   * Rata-rata pengeluaran per hari.
   */
  const averageDailySpending =
    spending /
    BigInt(elapsedDays);

  /*
   * Sisa hari pada periode.
   */
  const remainingMilliseconds =
    Math.max(
      0,
      periodEnd -
        now.getTime(),
    );

  const remainingDays =
    isCurrentPeriod
      ? Math.max(
          0,
          Math.ceil(
            remainingMilliseconds /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  /*
   * Estimasi pengeluaran selama
   * sisa periode.
   */
  const projectedRemainingSpending =
    averageDailySpending *
    BigInt(remainingDays);

  /*
   * Available balance setelah
   * kewajiban yang sudah diketahui.
   */
  const availableBalance =
    currentBalance -
    upcomingObligations;

  /*
   * Estimasi saldo akhir:
   *
   * Current Balance
   * - Upcoming Obligations
   * - Projected Remaining Spending
   */
  const estimatedEndBalance =
    availableBalance -
    projectedRemainingSpending;

  return {
    currentBalance,

    upcomingObligations,

    availableBalance,

    spending,

    elapsedDays,

    remainingDays,

    averageDailySpending,

    projectedRemainingSpending,

    estimatedEndBalance,
  };
}