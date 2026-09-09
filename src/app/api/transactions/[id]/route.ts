import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteTransaction,
  getTransactionById,
  updateTransaction,
} from "@/services/transaction.service";
import {
  TransactionType,
} from "@/generated/prisma/client";
import { serializeBigInt } from "@/lib/serialize";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ==========================================
// GET TRANSACTION BY ID
// ==========================================

export async function GET(
  _request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    const transaction = await getTransactionById(
      session.user.id,
      id
    );

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaksi tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeBigInt(transaction),
    });
  } catch (error) {
    console.error(
      "Get transaction detail error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail transaksi.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// UPDATE TRANSACTION
// ==========================================

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

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
    // VALIDASI TYPE
    // ==========================================

    if (
      type !== undefined &&
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
    // VALIDASI AMOUNT
    // ==========================================

    let numericAmount: number | undefined;

    if (amount !== undefined) {
      numericAmount = Number(amount);

      if (
        !Number.isSafeInteger(numericAmount) ||
        numericAmount <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Jumlah transaksi harus lebih dari Rp0.",
          },
          { status: 400 }
        );
      }
    }

    // ==========================================
    // VALIDASI DATE
    // ==========================================

    let parsedDate: Date | undefined;

    if (transactionDate !== undefined) {
      parsedDate = new Date(transactionDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal transaksi tidak valid.",
          },
          { status: 400 }
        );
      }
    }

    // ==========================================
    // UPDATE
    // ==========================================

    const transaction = await updateTransaction(
      session.user.id,
      id,
      {
        type,
        walletId,
        categoryId,
        amount:
          numericAmount !== undefined
            ? BigInt(numericAmount)
            : undefined,
        transactionDate: parsedDate,
        description:
          typeof description === "string"
            ? description.trim() || undefined
            : description,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil diperbarui.",
      data: serializeBigInt(transaction),
    });
  } catch (error) {
    console.error(
      "Update transaction error:",
      error
    );

    if (error instanceof Error) {
      switch (error.message) {
        case "TRANSACTION_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Transaksi tidak ditemukan.",
            },
            { status: 404 }
          );

        case "WALLET_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message:
                "Wallet tidak ditemukan atau tidak aktif.",
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
                "Saldo wallet tidak mencukupi untuk perubahan transaksi ini.",
            },
            { status: 400 }
          );

        case "INVALID_AMOUNT":
          return NextResponse.json(
            {
              success: false,
              message:
                "Jumlah transaksi harus lebih dari Rp0.",
            },
            { status: 400 }
          );

        case "INVALID_TRANSACTION_TYPE":
          return NextResponse.json(
            {
              success: false,
              message:
                "Jenis transaksi tidak valid.",
            },
            { status: 400 }
          );

        case "INVALID_BALANCE":
          return NextResponse.json(
            {
              success: false,
              message:
                "Perubahan transaksi menghasilkan saldo yang tidak valid.",
            },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui transaksi.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE TRANSACTION
// ==========================================

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    await deleteTransaction(
      session.user.id,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dihapus.",
    });
  } catch (error) {
    console.error(
      "Delete transaction error:",
      error
    );

    if (error instanceof Error) {
      switch (error.message) {
        case "TRANSACTION_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Transaksi tidak ditemukan.",
            },
            { status: 404 }
          );

        case "WALLET_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Wallet tidak ditemukan.",
            },
            { status: 404 }
          );

        case "INVALID_WALLET":
          return NextResponse.json(
            {
              success: false,
              message:
                "Transaksi tidak memiliki wallet yang valid.",
            },
            { status: 400 }
          );

        case "INVALID_BALANCE":
          return NextResponse.json(
            {
              success: false,
              message:
                "Transaksi tidak dapat dihapus karena saldo wallet menjadi tidak valid.",
            },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus transaksi.",
      },
      { status: 500 }
    );
  }
}