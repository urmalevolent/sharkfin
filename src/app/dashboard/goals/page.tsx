import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getGoals } from "@/services/goal.service";
import { prisma } from "@/lib/prisma";
import GoalsClient from "./goals-client";

export default async function GoalsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [goals, wallets] =
    await Promise.all([
      getGoals(userId),

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

  const serializedGoals =
    goals.map((goal) => ({
      id: goal.id,
      name: goal.name,

      targetAmount:
        goal.targetAmount.toString(),

      currentAmount:
        goal.currentAmount.toString(),

      remaining:
        goal.remaining.toString(),

      progress: goal.progress,

      deadline:
        goal.deadline
          ? goal.deadline.toISOString()
          : null,

      requiredMonthlySaving:
        goal.requiredMonthlySaving !==
        null
          ? goal.requiredMonthlySaving.toString()
          : null,

      completed: goal.completed,

      wallet: goal.wallet
        ? {
            id: goal.wallet.id,
            name: goal.wallet.name,
            balance:
              goal.wallet.balance.toString(),
          }
        : null,

      createdAt:
        goal.createdAt.toISOString(),

      updatedAt:
        goal.updatedAt.toISOString(),
    }));

  const serializedWallets =
    wallets.map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      balance:
        wallet.balance.toString(),
    }));

  return (
    <GoalsClient
      initialGoals={serializedGoals}
      wallets={serializedWallets}
    />
  );
}