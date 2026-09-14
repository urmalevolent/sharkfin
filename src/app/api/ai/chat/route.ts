import { auth } from "@/auth";

import {
  NextResponse,
} from "next/server";

import {
  processAIChat,
} from "@/services/ai-chat.service";

/**
 * Convert every BigInt inside an object
 * into a string so it can safely be returned
 * through JSON.
 */
function serializeBigInt(
  value: unknown,
): unknown {
  if (
    typeof value === "bigint"
  ) {
    return value.toString();
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      serializeBigInt,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(
        value as Record<
          string,
          unknown
        >
      ).map(
        ([key, currentValue]) => [
          key,
          serializeBigInt(
            currentValue,
          ),
        ],
      ),
    );
  }

  return value;
}

export async function POST(
  request: Request,
) {
  try {
    const session =
      await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const question =
      typeof body.question ===
      "string"
        ? body.question
        : "";

    const conversationId =
      typeof body.conversationId ===
      "string"
        ? body.conversationId
        : undefined;

    if (!question.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pertanyaan tidak boleh kosong.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await processAIChat({
        userId:
          session.user.id,

        userName:
          session.user.name ??
          "User",

        question,

        conversationId,
      });

    const responseData =
      serializeBigInt({
        success: true,

        conversationId:
          result.conversationId,

        answer:
          result.answer,

        responseId:
          result.responseId,

        model:
          result.model,

        intent:
          result.intent,

        confidence:
          result.confidence,

        affordability:
          result.affordability ??
          null,
      });

    return NextResponse.json(
      responseData,
    );
  } catch (error) {
    console.error(
      "AI Chat Error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memproses pertanyaan.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
}