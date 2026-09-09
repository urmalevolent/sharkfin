import { auth } from "@/auth";
import {
  deleteBudget,
  getBudgetById,
  updateBudget,
} from "@/services/budget.service";
import { NextResponse } from "next/server";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint"
        ? value.toString()
        : value
    )
  );
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    const budget =
      await getBudgetById(
        session.user.id,
        id
      );

    return NextResponse.json({
      success: true,
      data: serializeBigInt(budget),
    });
  } catch (error) {
    console.error(
      "GET /api/budgets/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengambil budget.";

    const status =
      message ===
      "Budget tidak ditemukan."
        ? 404
        : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status,
      }
    );
  }
}

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
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const {
      categoryId,
      month,
      year,
      amount,
    } = body;

    let parsedAmount: bigint | undefined;

    if (
      amount !== undefined &&
      amount !== null &&
      amount !== ""
    ) {
      try {
        parsedAmount = BigInt(amount);
      } catch {
        return NextResponse.json(
          {
            success: false,
            message:
              "Jumlah budget harus berupa angka yang valid.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const budget =
      await updateBudget(
        session.user.id,
        id,
        {
          categoryId:
            categoryId !== undefined
              ? String(categoryId)
              : undefined,

          month:
            month !== undefined
              ? Number(month)
              : undefined,

          year:
            year !== undefined
              ? Number(year)
              : undefined,

          amount: parsedAmount,
        }
      );

    return NextResponse.json({
      success: true,
      message: "Budget berhasil diperbarui.",
      data: serializeBigInt(budget),
    });
  } catch (error) {
    console.error(
      "PATCH /api/budgets/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui budget.";

    let status = 500;

    if (
      message ===
      "Budget tidak ditemukan."
    ) {
      status = 404;
    } else if (
      message.includes("sudah ada") ||
      message.includes("Kategori pengeluaran") ||
      message.includes("Bulan harus") ||
      message.includes("Tahun tidak valid") ||
      message.includes("Jumlah budget")
    ) {
      status = 400;
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status,
      }
    );
  }
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
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    await deleteBudget(
      session.user.id,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Budget berhasil dihapus.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/budgets/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menghapus budget.";

    const status =
      message ===
      "Budget tidak ditemukan."
        ? 404
        : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status,
      }
    );
  }
}