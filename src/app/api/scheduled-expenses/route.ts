import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createScheduledExpense,
  getScheduledExpenses,
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

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const expenses = await getScheduledExpenses(session.user.id);

    return NextResponse.json({
      scheduledExpenses: serializeBigInt(expenses),
    });
  } catch (error) {
    console.error("GET /api/scheduled-expenses:", error);

    return NextResponse.json(
      {
        error: "Gagal mengambil scheduled expenses.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const {
      name,
      amount,
      walletId,
      nextDate,
      recurrence,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nama pengeluaran wajib diisi." },
        { status: 400 },
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Nominal harus lebih dari 0." },
        { status: 400 },
      );
    }

    if (!walletId || typeof walletId !== "string") {
      return NextResponse.json(
        { error: "Wallet wajib dipilih." },
        { status: 400 },
      );
    }

    if (!nextDate) {
      return NextResponse.json(
        { error: "Tanggal pengeluaran wajib diisi." },
        { status: 400 },
      );
    }

    const allowedRecurrence = [
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "YEARLY",
    ];

    if (!allowedRecurrence.includes(recurrence)) {
      return NextResponse.json(
        { error: "Jenis pengulangan tidak valid." },
        { status: 400 },
      );
    }

    const expense = await createScheduledExpense(
      session.user.id,
      {
        name,
        amount: BigInt(amount),
        walletId,
        nextDate: new Date(nextDate),
        recurrence,
      },
    );

    return NextResponse.json(
      {
        scheduledExpense: serializeBigInt(expense),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/scheduled-expenses:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat scheduled expense.",
      },
      { status: 500 },
    );
  }
}