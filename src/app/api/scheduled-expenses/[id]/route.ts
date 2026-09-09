import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteScheduledExpense,
  getScheduledExpenseById,
  updateScheduledExpense,
} from "@/services/scheduled-expense.service";

function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, currentValue) =>
      typeof currentValue === "bigint"
        ? currentValue.toString()
        : currentValue,
    ),
  );
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const expense = await getScheduledExpenseById(
      session.user.id,
      id,
    );

    if (!expense) {
      return NextResponse.json(
        { error: "Scheduled expense tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      scheduledExpense: serializeBigInt(expense),
    });
  } catch (error) {
    console.error("GET /api/scheduled-expenses/[id]:", error);

    return NextResponse.json(
      {
        error: "Gagal mengambil scheduled expense.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const updateData: {
      name?: string;
      amount?: bigint;
      walletId?: string;
      nextDate?: Date;
      recurrence?:
        | "DAILY"
        | "WEEKLY"
        | "MONTHLY"
        | "YEARLY";
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.amount !== undefined) {
      if (Number(body.amount) <= 0) {
        return NextResponse.json(
          { error: "Nominal harus lebih dari 0." },
          { status: 400 },
        );
      }

      updateData.amount = BigInt(body.amount);
    }

    if (body.walletId !== undefined) {
      updateData.walletId = body.walletId;
    }

    if (body.nextDate !== undefined) {
      updateData.nextDate = new Date(body.nextDate);
    }

    if (body.recurrence !== undefined) {
      const allowedRecurrence = [
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        "YEARLY",
      ];

      if (!allowedRecurrence.includes(body.recurrence)) {
        return NextResponse.json(
          { error: "Jenis pengulangan tidak valid." },
          { status: 400 },
        );
      }

      updateData.recurrence = body.recurrence;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const expense = await updateScheduledExpense(
      session.user.id,
      id,
      updateData,
    );

    return NextResponse.json({
      scheduledExpense: serializeBigInt(expense),
    });
  } catch (error) {
    console.error("PATCH /api/scheduled-expenses/[id]:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui scheduled expense.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    await deleteScheduledExpense(
      session.user.id,
      id,
    );

    return NextResponse.json({
      message: "Scheduled expense berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/scheduled-expenses/[id]:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menghapus scheduled expense.";

    const status = message.includes("tidak ditemukan")
      ? 404
      : 400;

    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}