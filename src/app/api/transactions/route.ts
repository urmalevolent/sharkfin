import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createTransaction,
  getTransactionSummary,
  getUserTransactions,
  getUserTransactionsPaginated,
} from "@/services/transaction.service";
import { TransactionType } from "@/generated/prisma/client";
import { serializeBigInt } from "@/lib/serialize";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const typeParam = searchParams.get("type") as TransactionType | null;
    const walletId = searchParams.get("walletId") ?? undefined;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const monthParam = searchParams.get("month") ?? undefined;

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    }

    if (pageParam !== null || limitParam !== null) {
      const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
      const limit = limitParam
        ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 15))
        : 15;

      const [result, summary] = await Promise.all([
        getUserTransactionsPaginated(session.user.id, {
          page,
          limit,
          type: typeParam ?? undefined,
          walletId,
          categoryId,
          search,
          startDate,
          endDate,
        }),
        getTransactionSummary(session.user.id, {
          walletId,
          categoryId,
          search,
          startDate,
          endDate,
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: serializeBigInt(result.transactions),
        pagination: result.pagination,
        summary: serializeBigInt(summary),
      });
    }

    const transactions = await getUserTransactions(session.user.id);

    return NextResponse.json({
      success: true,
      data: serializeBigInt(transactions),
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil transaksi.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      type,
      walletId,
      categoryId,
      amount,
      transactionDate,
      description,
    } = body;

    // ==========================================
    // VALIDASI JENIS TRANSAKSI
    // ==========================================

    if (
      type !== TransactionType.INCOME &&
      type !== TransactionType.EXPENSE
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Jenis transaksi tidak valid.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDASI WALLET
    // ==========================================

    if (!walletId) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet wajib dipilih.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDASI KATEGORI
    // ==========================================

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori wajib dipilih.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDASI JUMLAH
    // ==========================================

    const numericAmount = Number(amount);

    if (
      !Number.isSafeInteger(numericAmount) ||
      numericAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Jumlah transaksi harus lebih dari Rp0.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // BUAT TRANSAKSI
    // ==========================================

    const transaction = await createTransaction({
      userId: session.user.id,
      type,
      walletId,
      categoryId,
      amount: BigInt(numericAmount),
      transactionDate: transactionDate
        ? new Date(transactionDate)
        : new Date(),
      description:
        typeof description === "string"
          ? description.trim() || undefined
          : undefined,
    });

    // ==========================================
    // RESPONSE
    // ==========================================
    // Prisma menggunakan BigInt untuk nominal uang.
    // serializeBigInt mengubah semua BigInt menjadi string
    // sebelum dikirim melalui JSON.

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi berhasil ditambahkan.",
        data: serializeBigInt(transaction),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create transaction error:", error);

    // ==========================================
    // ERROR DARI TRANSACTION SERVICE
    // ==========================================

    if (error instanceof Error) {
      switch (error.message) {
        case "WALLET_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Wallet tidak ditemukan atau tidak aktif.",
            },
            { status: 404 }
          );

        case "CATEGORY_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Kategori tidak ditemukan.",
            },
            { status: 404 }
          );

        case "INSUFFICIENT_BALANCE":
          return NextResponse.json(
            {
              success: false,
              message:
                "Saldo wallet tidak mencukupi untuk transaksi ini.",
            },
            { status: 400 }
          );

        case "INVALID_AMOUNT":
          return NextResponse.json(
            {
              success: false,
              message: "Jumlah transaksi harus lebih dari Rp0.",
            },
            { status: 400 }
          );
      }
    }

    // ==========================================
    // ERROR UMUM
    // ==========================================

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan transaksi.",
      },
      { status: 500 }
    );
  }
}