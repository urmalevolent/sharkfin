import { prisma } from "@/lib/prisma";
import {
  TransactionType,
  CategoryType,
} from "@/generated/prisma/client";

interface CreateTransactionInput {
  userId: string;
  type: TransactionType;
  walletId: string;
  categoryId: string;
  amount: bigint;
  transactionDate: Date;
  description?: string;
}

interface UpdateTransactionInput {
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  amount?: bigint;
  transactionDate?: Date;
  description?: string;
}

export interface GetUserTransactionsOptions {
  page?: number;
  limit?: number;
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TransactionSummaryResult {
  income: bigint;
  expense: bigint;
  transfer: bigint;
  netCashflow: bigint;
}

function buildTransactionWhere(
  userId: string,
  options: GetUserTransactionsOptions = {},
) {
  const where: Record<string, unknown> = { userId };
  if (options.type) where.type = options.type;
  if (options.walletId) where.walletId = options.walletId;
  if (options.categoryId) where.categoryId = options.categoryId;
  if (options.startDate || options.endDate) {
    where.transactionDate = {
      ...(options.startDate ? { gte: options.startDate } : {}),
      ...(options.endDate ? { lt: options.endDate } : {}),
    };
  }
  if (options.search) {
    where.OR = [
      { description: { contains: options.search, mode: "insensitive" } },
      { wallet: { name: { contains: options.search, mode: "insensitive" } } },
      { fromWallet: { name: { contains: options.search, mode: "insensitive" } } },
      { toWallet: { name: { contains: options.search, mode: "insensitive" } } },
      { category: { name: { contains: options.search, mode: "insensitive" } } },
    ];
  }
  return where;
}

export async function getUserTransactions(
  userId: string,
  options?: GetUserTransactionsOptions,
) {
  const page = options?.page ? Math.max(1, options.page) : undefined;
  const limit = options?.limit
    ? Math.min(100, Math.max(1, options.limit))
    : undefined;
  const skip = page && limit ? (page - 1) * limit : undefined;

  const where = buildTransactionWhere(userId, options);

  return prisma.transaction.findMany({
    where,
    include: {
      wallet: true,
      category: true,
      fromWallet: true,
      toWallet: true,
    },
    orderBy: [
      { transactionDate: "desc" },
      { id: "desc" }, // Deterministik tie-breaker
    ],
    ...(skip !== undefined && { skip }),
    ...(limit !== undefined && { take: limit }),
  });
}

export async function getUserTransactionsPaginated(
  userId: string,
  options: GetUserTransactionsOptions = {},
) {
  const page = options.page ? Math.max(1, options.page) : 1;
  const limit = options.limit
    ? Math.min(100, Math.max(1, options.limit))
    : 15;
  const skip = (page - 1) * limit;

  const where = buildTransactionWhere(userId, options);

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        wallet: true,
        category: true,
        fromWallet: true,
        toWallet: true,
      },
      orderBy: [
        { transactionDate: "desc" },
        { id: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      hasMore: page * limit < totalCount,
    },
  };
}

export async function getTransactionSummary(
  userId: string,
  options: Omit<GetUserTransactionsOptions, "page" | "limit"> = {},
): Promise<TransactionSummaryResult> {
  const where = buildTransactionWhere(userId, options);

  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where,
    _sum: {
      amount: true,
    },
  });

  let income = BigInt(0);
  let expense = BigInt(0);
  let transfer = BigInt(0);

  for (const item of grouped) {
    const sum = item._sum.amount ?? BigInt(0);
    if (item.type === "INCOME") {
      income += sum;
    } else if (item.type === "EXPENSE") {
      expense += sum;
    } else if (item.type === "TRANSFER") {
      transfer += sum;
    }
  }

  const netCashflow = income - expense;

  return {
    income,
    expense,
    transfer,
    netCashflow,
  };
}

export async function getTransactionById(
  userId: string,
  transactionId: string
) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      wallet: true,
      category: true,
    },
  });
}

// ==========================================
// CREATE TRANSACTION
// ==========================================

export async function createTransaction(
  input: CreateTransactionInput
) {
  if (input.amount <= BigInt(0)) {
    throw new Error("INVALID_AMOUNT");
  }

  return prisma.$transaction(async (tx) => {
    // ------------------------------------------
    // Cari wallet
    // ------------------------------------------

    const wallet = await tx.wallet.findFirst({
      where: {
        id: input.walletId,
        userId: input.userId,
        isActive: true,
      },
    });

    if (!wallet) {
      throw new Error("WALLET_NOT_FOUND");
    }

    // ------------------------------------------
    // Cari category
    // ------------------------------------------

    const category = await tx.category.findFirst({
      where: {
        id: input.categoryId,
        type:
          input.type === TransactionType.INCOME
            ? CategoryType.INCOME
            : CategoryType.EXPENSE,
        OR: [
          {
            userId: input.userId,
          },
          {
            userId: null,
            isDefault: true,
          },
        ],
      },
    });

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    // ------------------------------------------
    // Expense tidak boleh melebihi saldo
    // ------------------------------------------

    if (
      input.type === TransactionType.EXPENSE &&
      wallet.balance < input.amount
    ) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    // ------------------------------------------
    // Buat transaction
    // ------------------------------------------

    const transaction = await tx.transaction.create({
      data: {
        userId: input.userId,
        type: input.type,
        walletId: input.walletId,
        categoryId: input.categoryId,
        amount: input.amount,
        transactionDate: input.transactionDate,
        description: input.description,
      },
      include: {
        wallet: true,
        category: true,
      },
    });

    // ------------------------------------------
    // Update wallet balance
    // ------------------------------------------

    const newBalance =
      input.type === TransactionType.INCOME
        ? wallet.balance + input.amount
        : wallet.balance - input.amount;

    await tx.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
      },
    });

    return transaction;
  });
}

// ==========================================
// UPDATE TRANSACTION
// ==========================================

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput
) {
  return prisma.$transaction(async (tx) => {
    // ------------------------------------------
    // Cari transaksi lama
    // ------------------------------------------

    const existingTransaction =
      await tx.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

    if (!existingTransaction) {
      throw new Error("TRANSACTION_NOT_FOUND");
    }

    // ------------------------------------------
    // Transaction type baru
    // ------------------------------------------

    const newType =
      input.type ?? existingTransaction.type;

    // Untuk sementara Edit hanya mendukung
    // INCOME dan EXPENSE.
    if (
      newType !== TransactionType.INCOME &&
      newType !== TransactionType.EXPENSE
    ) {
      throw new Error("INVALID_TRANSACTION_TYPE");
    }

    // ------------------------------------------
    // Wallet baru
    // ------------------------------------------

    const newWalletId =
      input.walletId ?? existingTransaction.walletId;

    if (!newWalletId) {
      throw new Error("WALLET_NOT_FOUND");
    }

    // ------------------------------------------
    // Category baru
    // ------------------------------------------

    const newCategoryId =
      input.categoryId ?? existingTransaction.categoryId;

    if (!newCategoryId) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    // ------------------------------------------
    // Amount baru
    // ------------------------------------------

    const newAmount =
      input.amount ?? existingTransaction.amount;

    if (newAmount <= BigInt(0)) {
      throw new Error("INVALID_AMOUNT");
    }

    // ------------------------------------------
    // Wallet tujuan harus aktif
    // ------------------------------------------

    const newWallet = await tx.wallet.findFirst({
      where: {
        id: newWalletId,
        userId,
        isActive: true,
      },
    });

    if (!newWallet) {
      throw new Error("WALLET_NOT_FOUND");
    }

    // ------------------------------------------
    // Validasi category
    // ------------------------------------------

    const newCategory = await tx.category.findFirst({
      where: {
        id: newCategoryId,
        type:
          newType === TransactionType.INCOME
            ? CategoryType.INCOME
            : CategoryType.EXPENSE,
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

    if (!newCategory) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    // ------------------------------------------
    // Ambil wallet lama
    // ------------------------------------------

    const oldWalletId = existingTransaction.walletId;

    if (!oldWalletId) {
      throw new Error("WALLET_NOT_FOUND");
    }

    const oldWallet = await tx.wallet.findFirst({
      where: {
        id: oldWalletId,
        userId,
      },
    });

    if (!oldWallet) {
      throw new Error("WALLET_NOT_FOUND");
    }

    // ------------------------------------------
    // Hitung efek transaksi lama
    // ------------------------------------------

    const oldEffect =
      existingTransaction.type === TransactionType.INCOME
        ? existingTransaction.amount
        : -existingTransaction.amount;

    // ------------------------------------------
    // Hitung efek transaksi baru
    // ------------------------------------------

    const newEffect =
      newType === TransactionType.INCOME
        ? newAmount
        : -newAmount;

    // ------------------------------------------
    // Hitung saldo akhir
    // ------------------------------------------

    let oldWalletFinalBalance = oldWallet.balance;
    let newWalletFinalBalance = newWallet.balance;

    if (oldWalletId === newWalletId) {
      // Wallet sama:
      //
      // saldo sekarang
      // - efek transaksi lama
      // + efek transaksi baru

      oldWalletFinalBalance =
        oldWallet.balance -
        oldEffect +
        newEffect;

      if (oldWalletFinalBalance < BigInt(0)) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      newWalletFinalBalance = oldWalletFinalBalance;
    } else {
      // ----------------------------------------
      // Wallet berbeda
      // ----------------------------------------
      //
      // Wallet lama:
      // kembalikan efek transaksi lama
      //
      // Wallet baru:
      // terapkan efek transaksi baru

      oldWalletFinalBalance =
        oldWallet.balance - oldEffect;

      newWalletFinalBalance =
        newWallet.balance + newEffect;

      if (newWalletFinalBalance < BigInt(0)) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      if (oldWalletFinalBalance < BigInt(0)) {
        throw new Error("INVALID_BALANCE");
      }
    }

    // ------------------------------------------
    // Update wallet lama
    // ------------------------------------------

    if (oldWalletId === newWalletId) {
      await tx.wallet.update({
        where: {
          id: oldWalletId,
        },
        data: {
          balance: oldWalletFinalBalance,
        },
      });
    } else {
      await tx.wallet.update({
        where: {
          id: oldWalletId,
        },
        data: {
          balance: oldWalletFinalBalance,
        },
      });

      await tx.wallet.update({
        where: {
          id: newWalletId,
        },
        data: {
          balance: newWalletFinalBalance,
        },
      });
    }

    // ------------------------------------------
    // Update transaction
    // ------------------------------------------

    const updatedTransaction =
      await tx.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          type: newType,
          walletId: newWalletId,
          categoryId: newCategoryId,
          amount: newAmount,
          transactionDate:
            input.transactionDate ??
            existingTransaction.transactionDate,
          description:
            input.description !== undefined
              ? input.description
              : existingTransaction.description,
        },
        include: {
          wallet: true,
          category: true,
        },
      });

    return updatedTransaction;
  });
}

// ==========================================
// DELETE TRANSACTION
// ==========================================

export async function deleteTransaction(
  userId: string,
  transactionId: string
) {
  return prisma.$transaction(async (tx) => {
    // ------------------------------------------
    // Cari transaksi
    // ------------------------------------------

    const transaction =
      await tx.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

    if (!transaction) {
      throw new Error("TRANSACTION_NOT_FOUND");
    }

    if (!transaction.walletId) {
      throw new Error("INVALID_WALLET");
    }

    // ------------------------------------------
    // Cari wallet
    // ------------------------------------------

    const wallet = await tx.wallet.findFirst({
      where: {
        id: transaction.walletId,
        userId,
      },
    });

    if (!wallet) {
      throw new Error("WALLET_NOT_FOUND");
    }

    // ------------------------------------------
    // Kembalikan efek transaksi
    // ------------------------------------------

    const newBalance =
      transaction.type === TransactionType.INCOME
        ? wallet.balance - transaction.amount
        : wallet.balance + transaction.amount;

    if (newBalance < BigInt(0)) {
      throw new Error("INVALID_BALANCE");
    }

    // ------------------------------------------
    // Update wallet
    // ------------------------------------------

    await tx.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
      },
    });

    // ------------------------------------------
    // Hapus transaction
    // ------------------------------------------

    await tx.transaction.delete({
      where: {
        id: transaction.id,
      },
    });

    return {
      success: true,
    };
  });
}