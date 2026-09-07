import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu harus login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const incomeAmount = Number(body.incomeAmount ?? 0);
    const incomeFrequency = String(body.incomeFrequency ?? "").trim();

    const walletName = String(body.walletName ?? "").trim();
    const walletType = String(body.walletType ?? "").trim();
    const walletBalance = Number(body.walletBalance ?? 0);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!incomeFrequency) {
      return NextResponse.json(
        {
          success: false,
          message: "Frekuensi pemasukan wajib dipilih.",
        },
        { status: 400 }
      );
    }

    if (!walletName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wallet wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!walletType) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipe wallet wajib dipilih.",
        },
        { status: 400 }
      );
    }

    if (incomeAmount < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Jumlah pemasukan tidak boleh negatif.",
        },
        { status: 400 }
      );
    }

    if (walletBalance < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Saldo wallet tidak boleh negatif.",
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          incomeAmount: BigInt(incomeAmount),
          incomeFrequency: incomeFrequency as
            | "MONTHLY"
            | "WEEKLY"
            | "IRREGULAR",
          onboardingCompleted: true,
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          userId,
          name: walletName,
          type: walletType as
            | "CASH"
            | "BANK"
            | "E_WALLET"
            | "SAVINGS"
            | "OTHER",
          balance: BigInt(walletBalance),
        },
      });

      return {
        user,
        wallet,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding berhasil diselesaikan.",
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          onboardingCompleted: result.user.onboardingCompleted,
        },
        wallet: {
          id: result.wallet.id,
          name: result.wallet.name,
          type: result.wallet.type,
          balance: result.wallet.balance.toString(),
        },
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyelesaikan onboarding.",
      },
      { status: 500 }
    );
  }
}