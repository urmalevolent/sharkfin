import { auth } from "@/auth";
import { NextResponse } from "next/server";

import {
  createConversation,
  getUserConversations,
} from "@/services/ai-conversation.service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const conversations =
      await getUserConversations(
        session.user.id,
      );

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error(
      "Get Conversations Error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Gagal mengambil conversation.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : undefined;

    const conversation =
      await createConversation(
        session.user.id,
        title,
      );

    return NextResponse.json(
      {
        success: true,
        conversation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create Conversation Error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Gagal membuat conversation baru.",
      },
      { status: 500 },
    );
  }
}