import { auth } from "@/auth";
import { NextResponse } from "next/server";

import {
  getConversationById,
  updateConversation,
  deleteConversation,
} from "@/services/ai-conversation.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Conversation ID tidak valid.",
        },
        { status: 400 },
      );
    }

    const conversation =
      await getConversationById(
        session.user.id,
        id,
      );

    if (!conversation) {
      return NextResponse.json(
        {
          message:
            "Conversation tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Get Conversation Error:",
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

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          message:
            "Judul conversation tidak boleh kosong.",
        },
        { status: 400 },
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        {
          message:
            "Judul conversation maksimal 100 karakter.",
        },
        { status: 400 },
      );
    }

    const conversation =
      await updateConversation(
        session.user.id,
        id,
        title,
      );

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Update Conversation Error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengubah conversation.";

    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    await deleteConversation(
      session.user.id,
      id,
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Delete Conversation Error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menghapus conversation.";

    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }
}