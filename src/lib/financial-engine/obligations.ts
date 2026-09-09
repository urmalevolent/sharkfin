import { prisma } from "@/lib/prisma";

export async function getObligationMetrics(
  userId: string,
) {
  const now = new Date();

  // Ambil scheduled expense aktif yang
  // masih pending dan tanggalnya belum lewat.
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
      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            balance: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        nextDate: "asc",
      },
    });

  const totalUpcoming =
    scheduledExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      BigInt(0),
    );

  const totalBalanceResult =
    await prisma.wallet.aggregate({
      where: {
        userId,
        isActive: true,
      },
      _sum: {
        balance: true,
      },
    });

  const totalBalance =
    totalBalanceResult._sum.balance ??
    BigInt(0);

  const availableBalance =
    totalBalance - totalUpcoming;

  const obligations =
    scheduledExpenses.map((expense) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      nextDate: expense.nextDate,
      recurrence: expense.recurrence,

      wallet: {
        id: expense.wallet.id,
        name: expense.wallet.name,
        balance: expense.wallet.balance,
        isActive: expense.wallet.isActive,
      },
    }));

  const nearestObligation =
    obligations.length > 0
      ? obligations[0]
      : null;

  return {
    totalUpcoming,
    availableBalance,
    obligationCount:
      obligations.length,

    nearestObligation,

    obligations,
  };
}