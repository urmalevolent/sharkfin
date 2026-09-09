import { prisma } from "@/lib/prisma";

type SpendingPeriod = {
  startDate: Date;
  endDate: Date;
};

type SpendingTrendDirection =
  | "NO_DATA"
  | "UP"
  | "DOWN"
  | "UNCHANGED";

function calculatePercentage(
  amount: bigint,
  total: bigint,
): number {
  if (total <= BigInt(0)) {
    return 0;
  }

  return Number(
    (
      (Number(amount) / Number(total)) *
      100
    ).toFixed(2),
  );
}

export async function getSpending(
  userId: string,
  period: SpendingPeriod,
) {
  const expenses = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      transactionDate: {
        gte: period.startDate,
        lt: period.endDate,
      },
    },
    select: {
      amount: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      transactionDate: true,
    },
    orderBy: {
      transactionDate: "asc",
    },
  });

  const totalSpending = expenses.reduce(
    (total, expense) =>
      total + expense.amount,
    BigInt(0),
  );

  const categoryMap = new Map<
    string,
    {
      categoryId: string | null;
      categoryName: string;
      amount: bigint;
      transactionCount: number;
    }
  >();

  for (const expense of expenses) {
    const key =
      expense.categoryId ?? "uncategorized";

    const existing = categoryMap.get(key);

    if (existing) {
      existing.amount += expense.amount;
      existing.transactionCount += 1;
    } else {
      categoryMap.set(key, {
        categoryId: expense.categoryId,
        categoryName:
          expense.category?.name ??
          "Tanpa Kategori",
        amount: expense.amount,
        transactionCount: 1,
      });
    }
  }

  const byCategory = Array.from(
    categoryMap.values(),
  )
    .sort((a, b) =>
      a.amount > b.amount
        ? -1
        : a.amount < b.amount
          ? 1
          : 0,
    )
    .map((item) => ({
      ...item,
      percentage: calculatePercentage(
        item.amount,
        totalSpending,
      ),
    }));

  /*
   * Untuk bulan berjalan, average daily spending
   * dihitung berdasarkan jumlah hari yang sudah
   * berjalan, bukan seluruh hari dalam bulan.
   */
  const now = new Date();

  const isCurrentPeriod =
    period.startDate.getFullYear() ===
      now.getFullYear() &&
    period.startDate.getMonth() ===
      now.getMonth();

  let elapsedDays: number;

  if (isCurrentPeriod) {
    elapsedDays = Math.max(
      1,
      now.getDate(),
    );
  } else {
    const elapsedMilliseconds =
      period.endDate.getTime() -
      period.startDate.getTime();

    elapsedDays = Math.max(
      1,
      Math.ceil(
        elapsedMilliseconds /
          (1000 * 60 * 60 * 24),
      ),
    );
  }

  const averageDailySpending =
    totalSpending /
    BigInt(elapsedDays);

  return {
    totalSpending,
    transactionCount: expenses.length,
    byCategory,
    averageDailySpending,
    elapsedDays,
  };
}

export async function getSpendingTrend(
  userId: string,
) {
  const now = new Date();

  const currentStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const currentEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  const previousStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const previousEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const [
    currentResult,
    previousResult,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: {
          gte: currentStart,
          lt: currentEnd,
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
          gte: previousStart,
          lt: previousEnd,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const currentSpending =
    currentResult._sum.amount ??
    BigInt(0);

  const previousSpending =
    previousResult._sum.amount ??
    BigInt(0);

  let changePercentage: number | null =
    null;

  if (previousSpending > BigInt(0)) {
    changePercentage = Number(
      (
        ((Number(currentSpending) -
          Number(previousSpending)) /
          Number(previousSpending)) *
        100
      ).toFixed(2),
    );
  }

  /*
   * Tentukan arah perubahan pengeluaran.
   *
   * NO_DATA
   *  Tidak ada data pengeluaran bulan sebelumnya
   *  yang bisa digunakan sebagai pembanding.
   *
   * UP
   *  Pengeluaran bulan ini meningkat.
   *
   * DOWN
   *  Pengeluaran bulan ini menurun.
   *
   * UNCHANGED
   *  Pengeluaran bulan ini sama dengan bulan sebelumnya.
   */
  let direction: SpendingTrendDirection =
    "NO_DATA";

  if (changePercentage !== null) {
    if (changePercentage > 0) {
      direction = "UP";
    } else if (changePercentage < 0) {
      direction = "DOWN";
    } else {
      direction = "UNCHANGED";
    }
  }

  return {
    currentSpending,
    previousSpending,
    changePercentage,
    direction,
  };
}