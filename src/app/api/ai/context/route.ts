import { auth } from "@/auth";
import { NextResponse } from "next/server";

import {
  getAIContext,
} from "@/services/ai-context.service";

export async function GET() {
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

    const context =
      await getAIContext(
        session.user.id,
        {
          name:
            session.user.name ??
            "User",
        },
      );

    return NextResponse.json(
      context,
    );
  } catch (error) {
    console.error(
      "AI Context Error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Gagal membuat AI context.",
      },
      {
        status: 500,
      },
    );
  }
}