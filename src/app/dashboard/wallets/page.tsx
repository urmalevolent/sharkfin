import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WalletsClient from "./wallets-client";

export default async function WalletsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const totalBalance = wallets
    .filter((wallet) => wallet.isActive)
    .reduce(
      (total, wallet) => total + wallet.balance,
      BigInt(0)
    );

  const serializedWallets = wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    balance: wallet.balance.toString(),
    isActive: wallet.isActive,
  }));

  return (
    <WalletsClient
      wallets={serializedWallets}
      totalBalance={totalBalance.toString()}
    />
  );
}