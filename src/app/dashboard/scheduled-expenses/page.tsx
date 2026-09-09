import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getScheduledExpenses } from "@/services/scheduled-expense.service";
import ScheduledExpensesClient from "./scheduled-expenses-client";

export default async function ScheduledExpensesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [expenses, wallets] = await Promise.all([
    getScheduledExpenses(userId),

    prisma.wallet.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        balance: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const serializedExpenses = expenses.map((expense) => ({
    id: expense.id,
    name: expense.name,
    amount: expense.amount.toString(),
    nextDate: expense.nextDate.toISOString(),
    recurrence: expense.recurrence,
    status: expense.status,
    isActive: expense.isActive,
    wallet: {
      id: expense.wallet.id,
      name: expense.wallet.name,
      balance: expense.wallet.balance.toString(),
    },
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  }));

  const serializedWallets = wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    balance: wallet.balance.toString(),
  }));

  return (
    <ScheduledExpensesClient
      initialExpenses={serializedExpenses}
      wallets={serializedWallets}
    />
  );
}