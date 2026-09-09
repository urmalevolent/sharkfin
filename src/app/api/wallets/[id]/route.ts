import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  deactivateWallet,
  getWalletById,
  updateWallet,
} from "@/services/wallet.service";
import { WalletType } from "@/generated/prisma/client";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/wallets/:id
 *
 * Mengubah informasi wallet.
 *
 * Yang boleh diubah:
 * - name
 * - type
 *
 * Balance TIDAK boleh diubah melalui endpoint ini.
 * Saldo hanya boleh berubah melalui:
 * - Transaction
 * - Transfer
 * - Adjustment
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    // ==========================================
    // 1. Cek authentication
    // ==========================================
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

    // ==========================================
    // 2. Ambil wallet ID dari URL
    // ==========================================
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID wallet wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 3. Pastikan wallet milik user yang login
    // ==========================================
    const existingWallet = await getWalletById(
      session.user.id,
      id
    );

    if (!existingWallet) {
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

    // ==========================================
    // 4. Ambil request body
    // ==========================================
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format data tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data wallet harus berupa object.",
        },
        {
          status: 400,
        }
      );
    }

    const data = body as Record<string, unknown>;

    // ==========================================
    // 5. Siapkan data yang akan diubah
    // ==========================================
    const updateData: {
      name?: string;
      type?: WalletType;
    } = {};

    // ==========================================
    // 6. Validasi nama wallet
    // ==========================================
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Nama wallet harus berupa teks.",
          },
          {
            status: 400,
          }
        );
      }

      const name = data.name.trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Nama wallet tidak boleh kosong.",
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

      updateData.name = name;
    }

    // ==========================================
    // 7. Validasi tipe wallet
    // ==========================================
    if (data.type !== undefined) {
      if (
        typeof data.type !== "string" ||
        !Object.values(WalletType).includes(
          data.type as WalletType
        )
      ) {
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

      updateData.type = data.type as WalletType;
    }

    // ==========================================
    // 8. Pastikan ada data yang ingin diubah
    // ==========================================
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data wallet yang diubah.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 9. Update wallet
    // ==========================================
    const wallet = await updateWallet(
      session.user.id,
      id,
      updateData
    );

    if (!wallet) {
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

    // ==========================================
    // 10. Response
    // ==========================================
    return NextResponse.json({
      success: true,
      message: "Wallet berhasil diperbarui.",
      data: {
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance.toString(),
        isActive: wallet.isActive,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/wallets/:id error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui wallet.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE /api/wallets/:id
 *
 * Wallet tidak benar-benar dihapus.
 *
 * DELETE akan mengubah:
 *
 * isActive: true
 *       ↓
 * isActive: false
 *
 * Hal ini dilakukan agar histori transaksi
 * tetap aman dan tidak kehilangan referensi wallet.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    // ==========================================
    // 1. Cek authentication
    // ==========================================
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

    // ==========================================
    // 2. Ambil wallet ID dari URL
    // ==========================================
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID wallet wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 3. Nonaktifkan wallet
    // ==========================================
    const result = await deactivateWallet(
      session.user.id,
      id
    );

    // ==========================================
    // 4. Tangani error dari service
    // ==========================================
    if (!result.success) {
      switch (result.reason) {
        case "NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Wallet tidak ditemukan.",
            },
            {
              status: 404,
            }
          );

        case "ALREADY_INACTIVE":
          return NextResponse.json(
            {
              success: false,
              message: "Wallet sudah tidak aktif.",
            },
            {
              status: 400,
            }
          );

        case "LAST_ACTIVE_WALLET":
          return NextResponse.json(
            {
              success: false,
              message:
                "Kamu harus memiliki minimal satu wallet aktif.",
            },
            {
              status: 400,
            }
          );

        default:
          return NextResponse.json(
            {
              success: false,
              message:
                "Wallet tidak dapat dinonaktifkan.",
            },
            {
              status: 400,
            }
          );
      }
    }

    // ==========================================
    // 5. Pastikan wallet tersedia
    // ==========================================
    if (!result.wallet) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet berhasil diproses tetapi datanya tidak ditemukan.",
        },
        {
          status: 500,
        }
      );
    }

    const wallet = result.wallet;

    // ==========================================
    // 6. Response
    // ==========================================
    return NextResponse.json({
      success: true,
      message: "Wallet berhasil dinonaktifkan.",
      data: {
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance.toString(),
        isActive: wallet.isActive,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    });
  } catch (error) {
    console.error("DELETE /api/wallets/:id error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menonaktifkan wallet.",
      },
      {
        status: 500,
      }
    );
  }
}