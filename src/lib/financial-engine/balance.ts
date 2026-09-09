import { prisma } from "@/lib/prisma";

export async function getTotalBalance(userId: string) {
  const result = await prisma.wallet.aggregate({
    where: {
      userId,
      isActive: true,
    },
    _sum: {
      balance: true,
    },
  });

  return result._sum.balance ?? BigInt(0);
}