import {
buildSystemPrompt,
buildFinancialPrompt,
} from "@/lib/ai/prompts";

import {
getGeminiClient,
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
affordability?: AffordabilityResult | undefined;
};

const MODEL =
process.env.GEMINI_MODEL ??
"gemini-3.8-flash";

const FALLBACK_MODEL =
process.env.GEMINI_FALLBACK_MODEL ??
"gemini-3.6-flash";

function getErrorMessage(error: unknown): string {
return error instanceof Error
? error.message
: String(error);
}

/**

Mengenali error kuota dan gangguan layanan Gemini

yang memungkinkan percobaan menggunakan model cadangan.
*/
function isRetryableQuotaOrServiceError(
error: unknown,
): boolean {
const message = getErrorMessage(error);

return (
/\b429\b/.test(message) ||
/\b503\b/.test(message) ||
/RESOURCE_EXHAUSTED/i.test(message) ||
/UNAVAILABLE/i.test(message)
);
}

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

const gemini = getGeminiClient();

const financialPrompt = buildFinancialPrompt(
context,
question.trim(),
conversationHistory,
options,
);

const config = {
systemInstruction: buildSystemPrompt(),
};

let response:
| Awaited<
ReturnType<
typeof gemini.models.generateContent
>
>
| undefined;

let usedModel = MODEL;

// Percobaan pertama menggunakan model utama.
try {
console.info(
"[Ask SharkFin] Memanggil model utama: " +
MODEL,
);

response = await gemini.models.generateContent({
  model: MODEL,
  contents: financialPrompt,
  config,
});

} catch (primaryError) {
const primaryMessage =
getErrorMessage(primaryError);

console.error(
  "[Ask SharkFin] Model utama gagal:",
  primaryMessage,
);

// Hanya mencoba model cadangan untuk error
// kuota habis atau gangguan layanan.
if (
  !isRetryableQuotaOrServiceError(primaryError)
) {
  throw new Error(
    "Gagal mendapatkan jawaban dari Gemini: " +
      primaryMessage,
  );
}

// Hindari mengulang permintaan ke model yang sama.
if (FALLBACK_MODEL === MODEL) {
  throw new Error(
    "Kuota atau layanan AI SharkFin sedang bermasalah. " +
      "Silakan coba kembali nanti.",
  );
}

// Percobaan kedua menggunakan model cadangan.
try {
  console.info(
    "[Ask SharkFin] Mencoba model cadangan: " +
      FALLBACK_MODEL,
  );

  response = await gemini.models.generateContent({
    model: FALLBACK_MODEL,
    contents: financialPrompt,
    config,
  });

  usedModel = FALLBACK_MODEL;
} catch (fallbackError) {
  const fallbackMessage =
    getErrorMessage(fallbackError);

  console.error(
    "[Ask SharkFin] Model cadangan gagal:",
    fallbackMessage,
  );

  if (
    isRetryableQuotaOrServiceError(
      fallbackError,
    )
  ) {
    throw new Error(
      "Kuota AI SharkFin sedang habis atau layanan sedang sibuk. " +
        "Silakan coba kembali nanti.",
    );
  }

  throw new Error(
    "AI SharkFin belum dapat menjawab saat ini. " +
      "Silakan coba kembali beberapa saat lagi.",
  );
}

}

if (!response) {
throw new Error(
"Gemini tidak menghasilkan respons. Silakan coba kembali.",
);
}

const answer = response.text?.trim();

if (!answer) {
throw new Error(
"Gemini tidak menghasilkan jawaban teks. Silakan coba kembali.",
);
}

console.info(
"[Ask SharkFin] Jawaban berhasil menggunakan model: " +
usedModel,
);

return {
answer,
responseId: response.responseId ?? "",
model: usedModel,
};
}