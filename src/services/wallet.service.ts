import { prisma } from "@/lib/prisma";
import { WalletType } from "@/generated/prisma/client";

interface CreateWalletInput {
  userId: string;
  name: string;
  type: WalletType;
  balance: bigint;
}

interface UpdateWalletInput {
  name?: string;
  type?: WalletType;
}

/**
 * Mengambil semua wallet milik user.
 */
export async function getUserWallets(userId: string) {
  const wallets = await prisma.wallet.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const totalBalance = wallets
    .filter((wallet) => wallet.isActive)
    .reduce((total, wallet) => total + wallet.balance, BigInt(0));

  return {
    wallets,
    totalBalance,
  };
}

/**
 * Membuat wallet baru.
 */
export async function createWallet(input: CreateWalletInput) {
  const wallet = await prisma.wallet.create({
    data: {
      userId: input.userId,
      name: input.name,
      type: input.type,
      balance: input.balance,
    },
  });

  return wallet;
}

/**
 * Mengambil satu wallet milik user.
 */
export async function getWalletById(
  userId: string,
  walletId: string
) {
  return prisma.wallet.findFirst({
    where: {
      id: walletId,
      userId,
    },
  });
}

/**
 * Mengubah wallet.
 *
 * Balance TIDAK boleh diubah melalui fungsi ini.
 * Saldo hanya berubah melalui Transaction / Transfer / Adjustment.
 */
export async function updateWallet(
  userId: string,
  walletId: string,
  input: UpdateWalletInput
) {
  const wallet = await getWalletById(userId, walletId);

  if (!wallet) {
    return null;
  }

  return prisma.wallet.update({
    where: {
      id: walletId,
    },
    data: {
      ...(input.name !== undefined && {
        name: input.name,
      }),
      ...(input.type !== undefined && {
        type: input.type,
      }),
    },
  });
}

/**
 * Menonaktifkan wallet.
 *
 * Wallet tidak benar-benar dihapus agar histori transaksi tetap aman.
 */
export async function deactivateWallet(
  userId: string,
  walletId: string
) {
  const wallet = await getWalletById(userId, walletId);

  if (!wallet) {
    return {
      success: false,
      reason: "NOT_FOUND",
    };
  }

  if (!wallet.isActive) {
    return {
      success: false,
      reason: "ALREADY_INACTIVE",
    };
  }

  // Pastikan user masih memiliki minimal satu wallet aktif.
  const activeWalletCount = await prisma.wallet.count({
    where: {
      userId,
      isActive: true,
    },
  });

  if (activeWalletCount <= 1) {
    return {
      success: false,
      reason: "LAST_ACTIVE_WALLET",
    };
  }

  const updatedWallet = await prisma.wallet.update({
    where: {
      id: walletId,
    },
    data: {
      isActive: false,
    },
  });

  return {
    success: true,
    wallet: updatedWallet,
  };
}

export async function activateWallet(
  userId: string,
  walletId: string
) {
  const wallet = await getWalletById(userId, walletId);

  if (!wallet) {
    return {
      success: false,
      reason: "NOT_FOUND",
    } as const;
  }

  if (wallet.isActive) {
    return {
      success: false,
      reason: "ALREADY_ACTIVE",
    } as const;
  }

  const updatedWallet = await prisma.wallet.update({
    where: {
      id: walletId,
    },
    data: {
      isActive: true,
    },
  });

  return {
    success: true,
    wallet: updatedWallet,
  } as const;
}

