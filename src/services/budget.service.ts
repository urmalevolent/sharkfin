import { prisma } from "@/lib/prisma";

type CreateBudgetInput = {
  userId: string;
  categoryId: string;
  month: number;
  year: number;
  amount: bigint;
};

type UpdateBudgetInput = {
  categoryId?: string;
  month?: number;
  year?: number;
  amount?: bigint;
};

type BudgetStatus =
  | "NORMAL"
  | "WATCH"
  | "WARNING"
  | "EXCEEDED";

function validatePeriod(month: number, year: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Bulan harus berada di antara 1 sampai 12.");
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Tahun tidak valid.");
  }
}

function validateAmount(amount: bigint) {
  if (amount <= BigInt(0)) {
    throw new Error("Jumlah budget harus lebih dari 0.");
  }
}

async function validateCategory(
  userId: string,
  categoryId: string
) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      type: "EXPENSE",
      OR: [
        {
          userId,
        },
        {
          userId: null,
          isDefault: true,
        },
      ],
    },
  });

  if (!category) {
    throw new Error("Kategori pengeluaran tidak ditemukan.");
  }

  return category;
}

function calculateBudgetStatus(
  usage: number
): BudgetStatus {
  if (usage >= 100) {
    return "EXCEEDED";
  }

  if (usage >= 85) {
    return "WARNING";
  }

  if (usage >= 70) {
    return "WATCH";
  }

  return "NORMAL";
}

function calculateUsage(
  spent: bigint,
  budgetAmount: bigint
): number {
  if (budgetAmount <= BigInt(0)) {
    return 0;
  }

  return Number(
    (spent * BigInt(10000)) / budgetAmount
  ) / 100;
}

function getPeriodDates(
  month: number,
  year: number
) {
  const startDate = new Date(
    year,
    month - 1,
    1
  );

  const endDate = new Date(
    year,
    month,
    1
  );

  return {
    startDate,
    endDate,
  };
}

/**
 * Mengambil seluruh budget user
 * pada bulan tertentu.
 *
 * Sekaligus menghitung:
 * - spent
 * - remaining
 * - usage
 * - status
 */
export async function getBudgets(
  userId: string,
  month?: number,
  year?: number
) {
  const now = new Date();

  const targetMonth =
    month ?? now.getMonth() + 1;

  const targetYear =
    year ?? now.getFullYear();

  validatePeriod(
    targetMonth,
    targetYear
  );

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month: targetMonth,
      year: targetYear,
    },
    include: {
      category: true,
    },
    orderBy: {
      category: {
        name: "asc",
      },
    },
  });

  if (budgets.length === 0) {
    return [];
  }

  const {
    startDate,
    endDate,
  } = getPeriodDates(
    targetMonth,
    targetYear
  );

  const results = await Promise.all(
    budgets.map(async (budget) => {
      const expenseResult =
        await prisma.transaction.aggregate({
          where: {
            userId,
            type: "EXPENSE",
            categoryId: budget.categoryId,
            transactionDate: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

      const spent =
        expenseResult._sum.amount ??
        BigInt(0);

      const remaining =
        budget.amount > spent
          ? budget.amount - spent
          : BigInt(0);

      const usage = calculateUsage(
        spent,
        budget.amount
      );

      const status =
        calculateBudgetStatus(usage);

      return {
        id: budget.id,

        category: {
          id: budget.category.id,
          name: budget.category.name,
          icon: budget.category.icon,
        },

        month: budget.month,
        year: budget.year,

        amount: budget.amount,
        spent,
        remaining,

        usage,
        status,

        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      };
    })
  );

  return results;
}

/**
 * Mengambil satu budget berdasarkan ID.
 */
export async function getBudgetById(
  userId: string,
  budgetId: string
) {
  const budget =
    await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

  if (!budget) {
    throw new Error(
      "Budget tidak ditemukan."
    );
  }

  const budgets = await getBudgets(
    userId,
    budget.month,
    budget.year
  );

  const result = budgets.find(
    (item) => item.id === budgetId
  );

  if (!result) {
    throw new Error(
      "Gagal menghitung data budget."
    );
  }

  return result;
}

/**
 * Membuat budget baru.
 */
export async function createBudget(
  input: CreateBudgetInput
) {
  const {
    userId,
    categoryId,
    month,
    year,
    amount,
  } = input;

  validatePeriod(
    month,
    year
  );

  validateAmount(amount);

  await validateCategory(
    userId,
    categoryId
  );

  const existingBudget =
    await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
    });

  if (existingBudget) {
    throw new Error(
      "Budget untuk kategori ini pada bulan tersebut sudah ada."
    );
  }

  const budget =
    await prisma.budget.create({
      data: {
        userId,
        categoryId,
        month,
        year,
        amount,
      },
      include: {
        category: true,
      },
    });

  return budget;
}

/**
 * Mengubah budget.
 */
export async function updateBudget(
  userId: string,
  budgetId: string,
  input: UpdateBudgetInput
) {
  const existingBudget =
    await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

  if (!existingBudget) {
    throw new Error(
      "Budget tidak ditemukan."
    );
  }

  const categoryId =
    input.categoryId ??
    existingBudget.categoryId;

  const month =
    input.month ??
    existingBudget.month;

  const year =
    input.year ??
    existingBudget.year;

  const amount =
    input.amount ??
    existingBudget.amount;

  validatePeriod(
    month,
    year
  );

  validateAmount(amount);

  await validateCategory(
    userId,
    categoryId
  );

  const duplicate =
    await prisma.budget.findFirst({
      where: {
        userId,
        categoryId,
        month,
        year,
        NOT: {
          id: budgetId,
        },
      },
    });

  if (duplicate) {
    throw new Error(
      "Budget untuk kategori dan periode tersebut sudah ada."
    );
  }

  const updatedBudget =
    await prisma.budget.update({
      where: {
        id: budgetId,
      },
      data: {
        categoryId,
        month,
        year,
        amount,
      },
      include: {
        category: true,
      },
    });

  return updatedBudget;
}

/**
 * Menghapus budget.
 */
export async function deleteBudget(
  userId: string,
  budgetId: string
) {
  const budget =
    await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

  if (!budget) {
    throw new Error(
      "Budget tidak ditemukan."
    );
  }

  await prisma.budget.delete({
    where: {
      id: budgetId,
    },
  });

  return {
    success: true,
  };
}