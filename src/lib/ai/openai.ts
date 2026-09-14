import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY belum dikonfigurasi.",
    );
  }

  return new OpenAI({
    apiKey,
  });
}