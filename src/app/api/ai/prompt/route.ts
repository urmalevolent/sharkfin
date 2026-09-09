import { auth } from "@/auth";
import { NextResponse } from "next/server";

import {
  getAIContext,
} from "@/services/ai-context.service";

import {
  buildSystemPrompt,
  buildFinancialPrompt,
} from "@/lib/ai/prompts";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
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

    const systemPrompt =
      buildSystemPrompt();

    const financialPrompt =
      buildFinancialPrompt(
        context,
        "Bagaimana kondisi keuangan saya saat ini?",
      );

    return NextResponse.json({
      systemPrompt,
      financialPrompt,
    });
  } catch (error) {
    console.error(
      "AI Prompt Error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Gagal membuat AI prompt.",
      },
      {
        status: 500,
      },
    );
  }
}