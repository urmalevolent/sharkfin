import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBudgets } from "@/services/budget.service";
import { prisma } from "@/lib/prisma";
import BudgetsClient from "./budgets-client";

function serializeBudget(budget: Awaited<ReturnType<typeof getBudgets>>[number]) {
  return {
    id: budget.id,

    category: {
      id: budget.category.id,
      name: budget.category.name,
      icon: budget.category.icon,
    },

    month: budget.month,
    year: budget.year,

    amount: budget.amount.toString(),
    spent: budget.spent.toString(),
    remaining: budget.remaining.toString(),

    usage: budget.usage,
    status: budget.status,

    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
  };
}

export default async function BudgetsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [budgets, categories] = await Promise.all([
    getBudgets(userId, month, year),

    prisma.category.findMany({
      where: {
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
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const serializedBudgets = budgets.map(serializeBudget);

  const serializedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
  }));

  return (
    <BudgetsClient
      initialBudgets={serializedBudgets}
      categories={serializedCategories}
      initialMonth={month}
      initialYear={year}
    />
  );
}