import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/client";

interface CreateTransferInput {
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: bigint;
  transactionDate: Date;
  description?: string;
}

export async function getUserTransfers(userId: string) {
  return prisma.transaction.findMany({
    where: {
      userId,
      type: TransactionType.TRANSFER,
    },
    include: {
      fromWallet: true,
      toWallet: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  });
}

export async function getTransferById(
  userId: string,
  transactionId: string
) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
      type: TransactionType.TRANSFER,
    },
    include: {
      fromWallet: true,
      toWallet: true,
    },
  });
}

export async function createTransfer(input: CreateTransferInput) {
  if (input.amount <= BigInt(0)) {
    throw new Error("INVALID_AMOUNT");
  }

  if (input.fromWalletId === input.toWalletId) {
    throw new Error("SAME_WALLET");
  }

  return prisma.$transaction(async (tx) => {
    const fromWallet = await tx.wallet.findFirst({
      where: {
        id: input.fromWalletId,
        userId: input.userId,
        isActive: true,
      },
    });

    if (!fromWallet) {
      throw new Error("FROM_WALLET_NOT_FOUND");
    }

    const toWallet = await tx.wallet.findFirst({
      where: {
        id: input.toWalletId,
        userId: input.userId,
        isActive: true,
      },
    });

    if (!toWallet) {
      throw new Error("TO_WALLET_NOT_FOUND");
    }

    if (fromWallet.balance < input.amount) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const transaction = await tx.transaction.create({
      data: {
        userId: input.userId,
        type: TransactionType.TRANSFER,
        fromWalletId: input.fromWalletId,
        toWalletId: input.toWalletId,
        amount: input.amount,
        transactionDate: input.transactionDate,
        description: input.description,
      },
      include: {
        fromWallet: true,
        toWallet: true,
      },
    });

    await tx.wallet.update({
      where: {
        id: fromWallet.id,
      },
      data: {
        balance: fromWallet.balance - input.amount,
      },
    });

    await tx.wallet.update({
      where: {
        id: toWallet.id,
      },
      data: {
        balance: toWallet.balance + input.amount,
      },
    });

    return transaction;
  });
}

export async function deleteTransfer(
  userId: string,
  transactionId: string
) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        type: TransactionType.TRANSFER,
      },
    });

    if (!transfer) {
      throw new Error("TRANSFER_NOT_FOUND");
    }

    if (!transfer.fromWalletId || !transfer.toWalletId) {
      throw new Error("INVALID_TRANSFER");
    }

    const fromWallet = await tx.wallet.findFirst({
      where: {
        id: transfer.fromWalletId,
        userId,
      },
    });

    const toWallet = await tx.wallet.findFirst({
      where: {
        id: transfer.toWalletId,
        userId,
      },
    });

    if (!fromWallet || !toWallet) {
      throw new Error("WALLET_NOT_FOUND");
    }

    /*
     * Reverse transfer:
     *
     * Sebelumnya:
     * FROM - amount
     * TO   + amount
     *
     * Setelah delete:
     * FROM + amount
     * TO   - amount
     */

    const newFromBalance =
      fromWallet.balance + transfer.amount;

    const newToBalance =
      toWallet.balance - transfer.amount;

    if (newToBalance < BigInt(0)) {
      throw new Error("INVALID_BALANCE");
    }

    await tx.wallet.update({
      where: {
        id: fromWallet.id,
      },
      data: {
        balance: newFromBalance,
      },
    });

    await tx.wallet.update({
      where: {
        id: toWallet.id,
      },
      data: {
        balance: newToBalance,
      },
    });

    await tx.transaction.delete({
      where: {
        id: transfer.id,
      },
    });

    return {
      success: true,
    };
  });
}