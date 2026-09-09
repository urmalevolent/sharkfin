import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TransactionsClient from "./transactions-client";

export default async function TransactionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [transactions, wallets, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        wallet: true,
        category: true,
        fromWallet: true,
        toWallet: true,
      },
      orderBy: {
        transactionDate: "desc",
      },
    }),

    prisma.wallet.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.category.findMany({
      where: {
        OR: [
          {
            userId: session.user.id,
          },
          {
            userId: null,
            isDefault: true,
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const serializedTransactions = transactions.map(
    (transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      transactionDate:
        transaction.transactionDate.toISOString(),
      description: transaction.description,

      wallet: transaction.wallet
        ? {
            id: transaction.wallet.id,
            name: transaction.wallet.name,
          }
        : null,

      fromWallet: transaction.fromWallet
        ? {
            id: transaction.fromWallet.id,
            name: transaction.fromWallet.name,
          }
        : null,

      toWallet: transaction.toWallet
        ? {
            id: transaction.toWallet.id,
            name: transaction.toWallet.name,
          }
        : null,

      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            type: transaction.category.type,
          }
        : null,
    })
  );

  const serializedWallets = wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    balance: wallet.balance.toString(),
  }));

  const serializedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    type: category.type,
  }));

  return (
    <TransactionsClient
      transactions={serializedTransactions}
      wallets={serializedWallets}
      categories={serializedCategories}
    />
  );
}