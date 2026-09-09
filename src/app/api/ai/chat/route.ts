import { auth } from "@/auth";
import { NextResponse } from "next/server";

import {
  getAIContext,
} from "@/services/ai-context.service";

import {
  generateFinancialResponse,
} from "@/services/llm.service";

export async function POST(
  request: Request,
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        {
          message:
            "Pertanyaan tidak boleh kosong.",
        },
        {
          status: 400,
        },
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        {
          message:
            "Pertanyaan terlalu panjang.",
        },
        {
          status: 400,
        },
      );
    }

    const context =
      await getAIContext(
        session.user.id,
        {
          name:
            session.user.name ??
            "User",
        },
      );

    const result =
      await generateFinancialResponse(
        context,
        question,
      );

    return NextResponse.json({
      success: true,

      answer:
        result.answer,

      responseId:
        result.responseId,

      model:
        result.model,
    });
  } catch (error) {
    console.error(
      "AI Chat Error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Maaf, SharkFin sedang mengalami gangguan. Silakan coba lagi.",
      },
      {
        status: 500,
      },
    );
  }
}