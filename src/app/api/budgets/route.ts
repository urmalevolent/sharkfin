import { auth } from "@/auth";
import {
  createBudget,
  getBudgets,
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

export async function GET(
  request: Request
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

    const { searchParams } =
      new URL(request.url);

    const monthParam =
      searchParams.get("month");

    const yearParam =
      searchParams.get("year");

    const month = monthParam
      ? Number(monthParam)
      : undefined;

    const year = yearParam
      ? Number(yearParam)
      : undefined;

    const budgets = await getBudgets(
      session.user.id,
      month,
      year
    );

    return NextResponse.json({
      success: true,
      data: serializeBigInt(budgets),
    });
  } catch (error) {
    console.error(
      "GET /api/budgets error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data budget.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
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

    const body = await request.json();

    const {
      categoryId,
      month,
      year,
      amount,
    } = body;

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kategori budget wajib dipilih.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      month === undefined ||
      month === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Bulan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      year === undefined ||
      year === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jumlah budget wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    let budgetAmount: bigint;

    try {
      budgetAmount = BigInt(amount);
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

    const budget = await createBudget({
      userId: session.user.id,
      categoryId: String(categoryId),
      month: Number(month),
      year: Number(year),
      amount: budgetAmount,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Budget berhasil dibuat.",
        data: serializeBigInt(budget),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/budgets error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal membuat budget.";

    const status =
      message.includes("sudah ada")
        ? 409
        : message.includes(
              "Kategori pengeluaran"
            )
          ? 400
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