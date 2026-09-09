import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { activateWallet } from "@/services/wallet.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID wallet tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await activateWallet(
      session.user.id,
      id
    );

    if (!result.success) {
      if (result.reason === "NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Wallet tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      if (result.reason === "ALREADY_ACTIVE") {
        return NextResponse.json(
          {
            success: false,
            message: "Wallet sudah aktif.",
          },
          {
            status: 400,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Wallet berhasil diaktifkan kembali.",
      data: {
        ...result.wallet,
        balance: result.wallet.balance.toString(),
      },
    });
  } catch (error) {
    console.error("Activate wallet error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengaktifkan wallet.",
      },
      {
        status: 500,
      }
    );
  }
}