import {
  buildSystemPrompt,
  buildFinancialPrompt,
} from "@/lib/ai/prompts";

import {
  openai,
} from "@/lib/ai/openai";

import type {
  AIContext,
} from "@/lib/ai/context";

const MODEL =
  process.env.SHARKFIN_AI_MODEL ??
  "gpt-5.6-luna";

export async function generateFinancialResponse(
  context: AIContext,
  question: string,
) {
  if (!question.trim()) {
    throw new Error(
      "Pertanyaan tidak boleh kosong.",
    );
  }

  const systemPrompt =
    buildSystemPrompt();

  const financialPrompt =
    buildFinancialPrompt(
      context,
      question.trim(),
    );

  const response =
    await openai.responses.create({
      model: MODEL,

      instructions:
        systemPrompt,

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