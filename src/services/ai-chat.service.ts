import {
  addConversationMessage,
  createConversation,
  getConversationById,
} from "@/services/ai-conversation.service";

import { getAIContext } from "@/services/ai-context.service";

import {
  classifyIntent,
  selectAIContext,
} from "@/lib/ai/intent";

import {
  buildConversationHistory,
} from "@/lib/ai/conversation";

import {
  getAffordabilityAnalysis,
} from "@/services/financial-engine.service";

import {
  generateFinancialResponse,
} from "@/services/llm.service";

type ProcessAIChatInput = {
  userId: string;
  userName: string;
  question: string;
  conversationId?: string;
};

type ProcessAIChatResult = {
  conversationId: string;
  answer: string;
  responseId: string;
  model: string;
  intent: string;
  confidence: number;
  affordability?: Awaited<
    ReturnType<typeof getAffordabilityAnalysis>
  >;
};

/**
 * Extract purchase amount from an affordability question.
 *
 * Supported examples:
 * - Rp600.000
 * - Rp 600.000
 * - 600.000
 * - 600 ribu
 * - 600rb
 * - 1,5 juta
 * - 1.5 juta
 * - 1 juta
 */
function parsePurchaseAmount(
  question: string,
): bigint | null {
  const normalized = question
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // --------------------------------------------------
  // Rp 600.000 / Rp600.000 / Rp 1.500.000
  // --------------------------------------------------

  const rupiahMatch = normalized.match(
    /rp\s*([0-9][0-9.,]*)/,
  );

  if (rupiahMatch) {
    const raw = rupiahMatch[1]
      .replace(/\./g, "")
      .replace(/,/g, "");

    if (/^\d+$/.test(raw)) {
      return BigInt(raw);
    }
  }

  // --------------------------------------------------
  // 600 ribu / 600rb
  // --------------------------------------------------

  const ribuMatch = normalized.match(
    /(\d+(?:[.,]\d+)?)\s*(?:ribu|rb)\b/,
  );

  if (ribuMatch) {
    const raw = ribuMatch[1].replace(",", ".");

    const value = Number(raw);

    if (Number.isFinite(value) && value > 0) {
      return BigInt(
        Math.round(value * 1_000),
      );
    }
  }

  // --------------------------------------------------
  // 1 juta / 1,5 juta / 1.5 juta
  // --------------------------------------------------

  const jutaMatch = normalized.match(
    /(\d+(?:[.,]\d+)?)\s*juta\b/,
  );

  if (jutaMatch) {
    const raw = jutaMatch[1].replace(",", ".");

    const value = Number(raw);

    if (Number.isFinite(value) && value > 0) {
      return BigInt(
        Math.round(value * 1_000_000),
      );
    }
  }

  // --------------------------------------------------
  // Plain number
  //
  // Only use this when the question contains
  // affordability-related purchase language.
  // --------------------------------------------------

  const hasPurchaseContext =
    /\b(beli|membeli|harga|harganya|bayar|biaya|pengeluaran)\b/.test(
      normalized,
    );

  if (hasPurchaseContext) {
    const plainNumberMatch =
      normalized.match(
        /(?:^|\s)(\d{4,})(?:\s|$)/,
      );

    if (plainNumberMatch) {
      return BigInt(
        plainNumberMatch[1],
      );
    }
  }

  return null;
}

/**
 * Process one Ask SharkFin request.
 *
 * This service is responsible for orchestrating:
 *
 * Conversation
 * → Intent
 * → Context
 * → Affordability
 * → LLM
 * → Conversation persistence
 */
export async function processAIChat(
  input: ProcessAIChatInput,
): Promise<ProcessAIChatResult> {
  const {
    userId,
    userName,
    question,
    conversationId: requestedConversationId,
  } = input;

  const trimmedQuestion =
    question.trim();

  if (!trimmedQuestion) {
    throw new Error(
      "Pertanyaan tidak boleh kosong.",
    );
  }

  // ==================================================
  // 1. Conversation
  // ==================================================

  let conversationId: string;

  let conversationHistory =
    "Belum ada percakapan sebelumnya.";

  if (requestedConversationId) {
    const conversation =
      await getConversationById(
        userId,
        requestedConversationId,
      );

    if (!conversation) {
      throw new Error(
        "Conversation tidak ditemukan.",
      );
    }

    conversationId =
      conversation.id;

    conversationHistory =
      buildConversationHistory(
        conversation.messages.map(
          (message) => ({
            role:
              message.role === "USER"
                ? "USER"
                : "ASSISTANT",
            content:
              message.content,
          }),
        ),
      );
  } else {
    const conversation =
      await createConversation(
        userId,
        trimmedQuestion.slice(0, 60),
      );

    conversationId =
      conversation.id;
  }

  // ==================================================
  // 2. Intent Classification
  // ==================================================

  const classification =
    classifyIntent(
      trimmedQuestion,
    );

  // ==================================================
  // 3. Get fresh financial context
  //
  // Context selalu diambil ulang dari database
  // agar data finansial tetap aktual.
  // ==================================================

  const context =
    await getAIContext(
      userId,
      {
        name: userName,
      },
    );

  // ==================================================
  // 4. Select relevant context
  //
  // Tidak semua context harus dikirim ke LLM.
  // ==================================================

  const selectedContext =
    selectAIContext(
      context,
      classification,
    );

  // ==================================================
  // 5. Affordability Analysis
  //
  // Hanya dijalankan ketika intent:
  // AFFORDABILITY
  // ==================================================

  let affordability:
    | Awaited<
        ReturnType<
          typeof getAffordabilityAnalysis
        >
      >
    | undefined;

  if (
    classification.intent ===
    "AFFORDABILITY"
  ) {
    const purchaseAmount =
      parsePurchaseAmount(
        trimmedQuestion,
      );

    // Jika user bertanya apakah mampu membeli
    // tetapi belum memberikan nominal.
    if (!purchaseAmount) {
      const answer =
        "Bisa saya bantu cek. Berapa nominal barang atau pembelian yang ingin kamu beli? Contoh: Rp600.000.";

      await addConversationMessage(
        userId,
        conversationId,
        "USER",
        trimmedQuestion,
      );

      await addConversationMessage(
        userId,
        conversationId,
        "ASSISTANT",
        answer,
      );

      return {
        conversationId,
        answer,
        responseId: "",
        model: "deterministic",
        intent:
          classification.intent,
        confidence:
          classification.confidence,
      };
    }

    affordability =
      await getAffordabilityAnalysis(
        userId,
        purchaseAmount,
      );
  }

  // ==================================================
  // 6. Generate AI response
  // ==================================================

  const result =
    await generateFinancialResponse(
      context,
      trimmedQuestion,
      conversationHistory,
      {
        intent:
          classification.intent,

        confidence:
          classification.confidence,

        selectedContext,

        affordability,
      },
    );

  // ==================================================
  // 7. Save USER message
  // ==================================================

  await addConversationMessage(
    userId,
    conversationId,
    "USER",
    trimmedQuestion,
  );

  // ==================================================
  // 8. Save SHARKFIN message
  // ==================================================

  await addConversationMessage(
    userId,
    conversationId,
    "ASSISTANT",
    result.answer,
    result.responseId,
  );

  // ==================================================
  // 9. Return result
  // ==================================================

  return {
    conversationId,

    answer:
      result.answer,

    responseId:
      result.responseId,

    model:
      result.model,

    intent:
      classification.intent,

    confidence:
      classification.confidence,

    affordability,
  };
}