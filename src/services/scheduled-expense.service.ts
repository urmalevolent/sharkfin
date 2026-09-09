import { prisma } from "@/lib/prisma";

type CreateScheduledExpenseInput = {
  name: string;
  amount: bigint;
  walletId: string;
  nextDate: Date;
  recurrence: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
};

type UpdateScheduledExpenseInput = {
  name?: string;
  amount?: bigint;
  walletId?: string;
  nextDate?: Date;
  recurrence?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  isActive?: boolean;
};

function validateAmount(amount: bigint) {
  if (amount <= BigInt(0)) {
    throw new Error("Nominal pengeluaran harus lebih dari 0.");
  }
}

async function validateWallet(userId: string, walletId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: {
      id: walletId,
      userId,
      isActive: true,
    },
  });

  if (!wallet) {
    throw new Error("Wallet tidak ditemukan atau tidak aktif.");
  }

  return wallet;
}

export async function getScheduledExpenses(userId: string) {
  return prisma.scheduledExpense.findMany({
    where: {
      userId,
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          balance: true,
        },
      },
    },
    orderBy: [
      {
        isActive: "desc",
      },
      {
        nextDate: "asc",
      },
    ],
  });
}

export async function getScheduledExpenseById(
  userId: string,
  id: string,
) {
  return prisma.scheduledExpense.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          balance: true,
        },
      },
      transactions: {
        select: {
          id: true,
          amount: true,
          transactionDate: true,
          description: true,
        },
        orderBy: {
          transactionDate: "desc",
        },
      },
    },
  });
}

export async function createScheduledExpense(
  userId: string,
  input: CreateScheduledExpenseInput,
) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Nama pengeluaran wajib diisi.");
  }

  validateAmount(input.amount);

  await validateWallet(userId, input.walletId);

  if (Number.isNaN(input.nextDate.getTime())) {
    throw new Error("Tanggal pengeluaran tidak valid.");
  }

  return prisma.scheduledExpense.create({
    data: {
      userId,
      walletId: input.walletId,
      name,
      amount: input.amount,
      nextDate: input.nextDate,
      recurrence: input.recurrence,
      status: "PENDING",
      isActive: true,
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          balance: true,
        },
      },
    },
  });
}

export async function updateScheduledExpense(
  userId: string,
  id: string,
  input: UpdateScheduledExpenseInput,
) {
  const existing = await prisma.scheduledExpense.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    throw new Error("Scheduled expense tidak ditemukan.");
  }

  if (input.amount !== undefined) {
    validateAmount(input.amount);
  }

  if (input.name !== undefined && !input.name.trim()) {
    throw new Error("Nama pengeluaran wajib diisi.");
  }

  if (input.nextDate !== undefined) {
    if (Number.isNaN(input.nextDate.getTime())) {
      throw new Error("Tanggal pengeluaran tidak valid.");
    }
  }

  if (input.walletId !== undefined) {
    await validateWallet(userId, input.walletId);
  }

  return prisma.scheduledExpense.update({
    where: {
      id,
    },
    data: {
      ...(input.name !== undefined && {
        name: input.name.trim(),
      }),
      ...(input.amount !== undefined && {
        amount: input.amount,
      }),
      ...(input.walletId !== undefined && {
        walletId: input.walletId,
      }),
      ...(input.nextDate !== undefined && {
        nextDate: input.nextDate,
      }),
      ...(input.recurrence !== undefined && {
        recurrence: input.recurrence,
      }),
      ...(input.isActive !== undefined && {
        isActive: input.isActive,
      }),
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          balance: true,
        },
      },
    },
  });
}

export async function deleteScheduledExpense(
  userId: string,
  id: string,
) {
  const existing = await prisma.scheduledExpense.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Scheduled expense tidak ditemukan.");
  }

  if (existing._count.transactions > 0) {
    throw new Error(
      "Scheduled expense yang sudah memiliki transaksi tidak dapat dihapus. Nonaktifkan saja.",
    );
  }

  return prisma.scheduledExpense.delete({
    where: {
      id,
    },
  });
}

export async function deactivateScheduledExpense(
  userId: string,
  id: string,
) {
  return updateScheduledExpense(userId, id, {
    isActive: false,
  });
}

export async function activateScheduledExpense(
  userId: string,
  id: string,
) {
  return updateScheduledExpense(userId, id, {
    isActive: true,
  });
}