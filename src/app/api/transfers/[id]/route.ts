import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteTransfer } from "@/services/transfer.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

    await deleteTransfer(
      session.user.id,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Transfer berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete transfer error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "TRANSFER_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Transfer tidak ditemukan.",
            },
            { status: 404 }
          );

        case "INVALID_TRANSFER":
          return NextResponse.json(
            {
              success: false,
              message: "Data transfer tidak valid.",
            },
            { status: 400 }
          );

        case "WALLET_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Wallet transfer tidak ditemukan.",
            },
            { status: 404 }
          );

        case "INVALID_BALANCE":
          return NextResponse.json(
            {
              success: false,
              message:
                "Transfer tidak dapat dihapus karena saldo wallet tujuan tidak mencukupi untuk membalikkan transaksi.",
            },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus transfer.",
      },
      { status: 500 }
    );
  }
}