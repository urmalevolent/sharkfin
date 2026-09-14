import {
  buildSystemPrompt,
  buildFinancialPrompt,
} from "@/lib/ai/prompts";

import {
  getOpenAIClient,
} from "@/lib/ai/openai";

import type {
  AIContext,
} from "@/lib/ai/context";

import type {
  AIIntent,
} from "@/lib/ai/intent";

import type {
  AffordabilityResult,
} from "@/lib/financial-engine";

type FinancialResponseOptions = {
  intent?: AIIntent;

  confidence?: number;

  selectedContext?: Partial<AIContext>;

  affordability?:
    | AffordabilityResult
    | undefined;
};

const MODEL =
  process.env.SHARKFIN_AI_MODEL ??
  "gpt-5.6-luna";

export async function generateFinancialResponse(
  context: AIContext,
  question: string,
  conversationHistory?: string,
  options?: FinancialResponseOptions,
) {
  if (!question.trim()) {
    throw new Error(
      "Pertanyaan tidak boleh kosong.",
    );
  }

  const openai =
    getOpenAIClient();

  const financialPrompt =
    buildFinancialPrompt(
      context,
      question.trim(),
      conversationHistory,
      options,
    );

  const response =
    await openai.responses.create({
      model: MODEL,

      instructions:
        buildSystemPrompt(),

      input:
        financialPrompt,
    });

  return {
    answer:
      response.output_text.trim(),

    responseId:
      response.id,

    model:
      MODEL,
  };
}