import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFinancialOverview } from "@/services/financial-engine.service";

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
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const overview =
      await getFinancialOverview(
        session.user.id,
      );

    return NextResponse.json(
      serializeBigInt(overview),
    );
  } catch (error) {
    console.error(
      "GET /api/financial-overview:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengambil financial overview.",
      },
      {
        status: 500,
      },
    );
  }
}