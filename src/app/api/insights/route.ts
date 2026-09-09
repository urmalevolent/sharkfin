import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserInsights } from "@/services/insight.service";

function serializeBigInt(
  value: unknown,
): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(
      serializeBigInt,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, item]) => [
          key,
          serializeBigInt(item),
        ],
      ),
    );
  }

  return value;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const result =
      await getUserInsights(
        session.user.id,
      );

    return NextResponse.json(
      serializeBigInt(result),
    );
  } catch (error) {
    console.error(
      "GET /api/insights error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengambil insight finansial.",
      },
      {
        status: 500,
      },
    );
  }
}