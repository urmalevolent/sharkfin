import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TransactionType } from "@/generated/prisma/client";
import {
  getUserTransactionsPaginated,
  getTransactionSummary,
} from "@/services/transaction.service";
import TransactionsClient from "./transactions-client";

interface TransactionsPageProps {
  searchParams?: Promise<{
    page?: string;
    type?: string;
    categoryId?: string;
    month?: string;
    search?: string;
  }>;
}

export default async function TransactionsPage(props: TransactionsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);
  const pageSize = 15;
  const type =
    resolvedParams.type && resolvedParams.type !== "ALL"
      ? (resolvedParams.type as TransactionType)
      : undefined;
  const categoryId =
    resolvedParams.categoryId && resolvedParams.categoryId !== "ALL"
      ? resolvedParams.categoryId
      : undefined;
  const search = resolvedParams.search?.trim() || undefined;
  const month = resolvedParams.month?.trim() || undefined;

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split("-").map(Number);
    startDate = new Date(year, m - 1, 1);
    endDate = new Date(year, m, 1);
  }

  const [paginatedData, summaryData, wallets, categories] = await Promise.all([
    getUserTransactionsPaginated(session.user.id, {
      page,
      limit: pageSize,
      type,
      categoryId,
      search,
      startDate,
      endDate,
    }),

    getTransactionSummary(session.user.id, {
      categoryId,
      search,
      startDate,
      endDate,
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

  const serializedTransactions = paginatedData.transactions.map(
    (transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      transactionDate: transaction.transactionDate.toISOString(),
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
    }),
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

  const serializedSummary = {
    income: Number(summaryData.income),
    expense: Number(summaryData.expense),
    transfer: Number(summaryData.transfer),
    netCashflow: Number(summaryData.netCashflow),
  };

  return (
    <TransactionsClient
      transactions={serializedTransactions}
      wallets={serializedWallets}
      categories={serializedCategories}
      pagination={paginatedData.pagination}
      summary={serializedSummary}
      initialFilters={{
        search: resolvedParams.search || "",
        type: resolvedParams.type || "ALL",
        categoryId: resolvedParams.categoryId || "ALL",
        month: resolvedParams.month || "",
      }}
    />
  );
}