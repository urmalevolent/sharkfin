import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createWallet,
  getUserWallets,
} from "@/services/wallet.service";
import { WalletType } from "@/generated/prisma/client";

export async function GET() {
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

    const result = await getUserWallets(session.user.id);

    return NextResponse.json({
      success: true,
      data: result.wallets.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance.toString(),
        isActive: wallet.isActive,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      })),
      totalBalance: result.totalBalance.toString(),
    });
  } catch (error) {
    console.error("GET /api/wallets error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data wallet.",
      },
      {
        status: 500,
      }
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
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const type = body.type;
    const balance = body.balance;

    // Validasi nama
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wallet wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wallet maksimal 100 karakter.",
        },
        {
          status: 400,
        }
      );
    }

    // Validasi tipe wallet
    if (!Object.values(WalletType).includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipe wallet tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // Validasi balance
    if (
      balance === undefined ||
      balance === null ||
      balance === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Saldo awal wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    let balanceBigInt: bigint;

    try {
      balanceBigInt = BigInt(balance);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Saldo harus berupa angka yang valid.",
        },
        {
          status: 400,
        }
      );
    }

    if (balanceBigInt < BigInt(0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Saldo tidak boleh kurang dari Rp0.",
        },
        {
          status: 400,
        }
      );
    }

    const wallet = await createWallet({
      userId: session.user.id,
      name,
      type,
      balance: balanceBigInt,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Wallet berhasil dibuat.",
        data: {
          id: wallet.id,
          name: wallet.name,
          type: wallet.type,
          balance: wallet.balance.toString(),
          isActive: wallet.isActive,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/wallets error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat wallet.",
      },
      {
        status: 500,
      }
    );
  }
}