import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createTransfer,
  getUserTransfers,
} from "@/services/transfer.service";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
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

    const transfers = await getUserTransfers(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: serializeBigInt(transfers),
    });
  } catch (error) {
    console.error("Get transfers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data transfer.",
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
      fromWalletId,
      toWalletId,
      amount,
      transactionDate,
      description,
    } = body;

    if (!fromWalletId) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet sumber wajib dipilih.",
        },
        { status: 400 }
      );
    }

    if (!toWalletId) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet tujuan wajib dipilih.",
        },
        { status: 400 }
      );
    }

    if (fromWalletId === toWalletId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet sumber dan tujuan harus berbeda.",
        },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    if (
      !Number.isSafeInteger(numericAmount) ||
      numericAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jumlah transfer harus berupa angka lebih dari Rp0.",
        },
        { status: 400 }
      );
    }

    const transfer = await createTransfer({
      userId: session.user.id,
      fromWalletId,
      toWalletId,
      amount: BigInt(numericAmount),
      transactionDate: transactionDate
        ? new Date(transactionDate)
        : new Date(),
      description:
        typeof description === "string"
          ? description.trim() || undefined
          : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transfer berhasil.",
        data: serializeBigInt(transfer),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create transfer error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_AMOUNT":
          return NextResponse.json(
            {
              success: false,
              message:
                "Jumlah transfer harus lebih dari Rp0.",
            },
            { status: 400 }
          );

        case "SAME_WALLET":
          return NextResponse.json(
            {
              success: false,
              message:
                "Wallet sumber dan tujuan harus berbeda.",
            },
            { status: 400 }
          );

        case "FROM_WALLET_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message:
                "Wallet sumber tidak ditemukan atau tidak aktif.",
            },
            { status: 404 }
          );

        case "TO_WALLET_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message:
                "Wallet tujuan tidak ditemukan atau tidak aktif.",
            },
            { status: 404 }
          );

        case "INSUFFICIENT_BALANCE":
          return NextResponse.json(
            {
              success: false,
              message:
                "Saldo wallet sumber tidak mencukupi.",
            },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal melakukan transfer.",
      },
      { status: 500 }
    );
  }
}