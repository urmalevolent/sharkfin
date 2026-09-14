import { prisma } from "@/lib/prisma";

export async function createConversation(
  userId: string,
  title?: string,
) {
  return prisma.aIConversation.create({
    data: {
      userId,
      title: title?.trim() || null,
    },
  });
}

export async function getUserConversations(
  userId: string,
) {
  return prisma.aIConversation.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
}

export async function getConversationById(
  userId: string,
  conversationId: string,
) {
  return prisma.aIConversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function addConversationMessage(
  userId: string,
  conversationId: string,
  role: "USER" | "ASSISTANT",
  content: string,
  responseId?: string,
) {
  const conversation =
    await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

  if (!conversation) {
    throw new Error(
      "Conversation tidak ditemukan.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const message =
      await tx.aIConversationMessage.create({
        data: {
          conversationId,
          role,
          content,
          responseId:
            responseId ?? null,
        },
      });

    await tx.aIConversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  });
}

export async function updateConversation(
  userId: string,
  conversationId: string,
  title: string,
) {
  const conversation =
    await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

  if (!conversation) {
    throw new Error(
      "Conversation tidak ditemukan.",
    );
  }

  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error(
      "Judul conversation tidak boleh kosong.",
    );
  }

  if (cleanTitle.length > 100) {
    throw new Error(
      "Judul conversation maksimal 100 karakter.",
    );
  }

  return prisma.aIConversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title: cleanTitle,
    },
  });
}

export async function deleteConversation(
  userId: string,
  conversationId: string,
) {
  const conversation =
    await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

  if (!conversation) {
    throw new Error(
      "Conversation tidak ditemukan.",
    );
  }

  return prisma.aIConversation.delete({
    where: {
      id: conversationId,
    },
  });
}