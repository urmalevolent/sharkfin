import type {
  AIContextKey,
  AIIntent,
  IntentClassification,
} from "./types";

type IntentRule = {
  intent: AIIntent;
  patterns: RegExp[];
  weight: number;
  reason: string;
};

const INTENT_RULES: IntentRule[] = [
  {
    intent: "AFFORDABILITY",
    patterns: [
      /\bbisa (?:beli|bayar|ambil|membeli)\b/i,
      /\bmampu (?:beli|bayar|membeli)\b/i,
      /\bsanggup\b/i,
      /\bcukup (?:untuk|buat)\b/i,
      /\bkira.?kira (?:cukup|mampu)\b/i,
      /\bboleh (?:beli|ambil)\b/i,
      /\bterjangkau\b/i,
      /\bafford\b/i,
      /\bpunya uang.*beli\b/i,
      /\bbeli.*aman\b/i,
      /\bbayar.*aman\b/i,
    ],
    weight: 5,
    reason: "Pertanyaan menilai kemampuan membeli atau membayar sesuatu.",
  },

  {
    intent: "GOAL",
    patterns: [
      /\bgoal\b/i,
      /\btarget\b/i,
      /\btujuan keuangan\b/i,
      /\btabungan.*target\b/i,
      /\btarget.*tabungan\b/i,
      /\bkejar target\b/i,
      /\bmencapai target\b/i,
      /\bberapa lama.*target\b/i,
      /\bkapan.*tercapai\b/i,
      /\btabungan laptop\b/i,
    ],
    weight: 5,
    reason: "Pertanyaan berkaitan dengan target atau financial goal.",
  },

  {
    intent: "BUDGET",
    patterns: [
      /\bbudget\b/i,
      /\banggaran\b/i,
      /\bbatas pengeluaran\b/i,
      /\bbatas.*kategori\b/i,
      /\bsisa.*budget\b/i,
      /\bbudget.*sisa\b/i,
      /\bbudget.*habis\b/i,
      /\bbudget.*terpakai\b/i,
      /\bmelewati budget\b/i,
      /\bover budget\b/i,
    ],
    weight: 5,
    reason: "Pertanyaan berkaitan dengan budget atau batas pengeluaran.",
  },

  {
    intent: "OBLIGATION",
    patterns: [
      /\btagihan\b/i,
      /\btagihan.*berikutnya\b/i,
      /\bpembayaran\b/i,
      /\bpembayaran.*berikutnya\b/i,
      /\bpengeluaran mendatang\b/i,
      /\bpengeluaran.*mendatang\b/i,
      /\bpengeluaran.*dekat\b/i,
      /\bjatuh tempo\b/i,
      /\bakan bayar\b/i,
      /\bharus bayar\b/i,
      /\bberapa hari lagi.*bayar\b/i,
      /\bbulan ini.*bayar\b/i,
    ],
    weight: 5,
    reason: "Pertanyaan berkaitan dengan kewajiban atau pengeluaran yang akan datang.",
  },

  {
    intent: "SPENDING",
    patterns: [
      /\bpengeluaran\b/i,
      /\bbelanja\b/i,
      /\bspent\b/i,
      /\bhabis\b/i,
      /\bpaling banyak\b/i,
      /\bterbesar\b/i,
      /\bkategori.*pengeluaran\b/i,
      /\bpengeluaran.*kategori\b/i,
      /\bboros\b/i,
      /\bbelanja.*bulan\b/i,
      /\bpengeluaran.*bulan\b/i,
      /\bspending\b/i,
    ],
    weight: 4,
    reason: "Pertanyaan membahas pola atau jumlah pengeluaran.",
  },

  {
    intent: "CASHFLOW",
    patterns: [
      /\bcashflow\b/i,
      /\barus kas\b/i,
      /\barus keuangan\b/i,
      /\bkeuangan bulan ini\b/i,
      /\bkondisi keuangan\b/i,
      /\bpemasukan.*pengeluaran\b/i,
      /\bpengeluaran.*pemasukan\b/i,
      /\bpendapatan.*pengeluaran\b/i,
      /\bnet cashflow\b/i,
      /\bsaving rate\b/i,
      /\btingkat menabung\b/i,
    ],
    weight: 4,
    reason: "Pertanyaan membahas arus masuk, arus keluar, atau kondisi keuangan.",
  },

  {
    intent: "BALANCE",
    patterns: [
      /\bsaldo\b/i,
      /\buang saya sekarang\b/i,
      /\buang yang saya punya\b/i,
      /\btotal uang\b/i,
      /\btotal saldo\b/i,
      /\bberapa uang\b/i,
      /\bberapa saldo\b/i,
      /\bsisa uang\b/i,
      /\bsisa saldo\b/i,
      /\bbalance\b/i,
    ],
    weight: 4,
    reason: "Pertanyaan meminta informasi tentang saldo atau uang yang tersedia.",
  },

  {
    intent: "GENERAL",
    patterns: [
      /\bapa yang sebaiknya\b/i,
      /\bsebaiknya saya\b/i,
      /\bsaran\b/i,
      /\bsarankan\b/i,
      /\bmenurut kamu\b/i,
      /\bbagaimana menurut\b/i,
      /\bapa yang harus saya lakukan\b/i,
      /\bharus bagaimana\b/i,
      /\bstrategi\b/i,
      /\brencana keuangan\b/i,
    ],
    weight: 2,
    reason: "Pertanyaan meminta saran atau arahan keuangan secara umum.",
  },
];

const CONTEXT_BY_INTENT: Record<AIIntent, AIContextKey[]> = {
  BALANCE: [
    "balance",
    "obligations",
    "wallets" as AIContextKey,
  ],

  CASHFLOW: [
    "cashflow",
    "balance",
    "spending",
    "financialHealth",
  ],

  SPENDING: [
    "spending",
    "cashflow",
    "budget",
  ],

  BUDGET: [
    "budget",
    "spending",
    "cashflow",
  ],

  GOAL: [
    "goals",
    "balance",
    "cashflow",
  ],

  OBLIGATION: [
    "obligations",
    "balance",
    "forecast",
  ],

  AFFORDABILITY: [
    "balance",
    "obligations",
    "goals",
    "spending",
    "forecast",
  ],

  GENERAL: [
    "user",
    "balance",
    "cashflow",
    "spending",
    "budget",
    "goals",
    "obligations",
    "forecast",
    "financialHealth",
    "insights",
  ],
};

function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function calculateIntentScores(question: string) {
  const scores: Record<AIIntent, number> = {
    BALANCE: 0,
    CASHFLOW: 0,
    SPENDING: 0,
    BUDGET: 0,
    GOAL: 0,
    OBLIGATION: 0,
    AFFORDABILITY: 0,
    GENERAL: 0,
  };

  const reasons: Record<AIIntent, string[]> = {
    BALANCE: [],
    CASHFLOW: [],
    SPENDING: [],
    BUDGET: [],
    GOAL: [],
    OBLIGATION: [],
    AFFORDABILITY: [],
    GENERAL: [],
  };

  for (const rule of INTENT_RULES) {
    let matched = false;

    for (const pattern of rule.patterns) {
      if (pattern.test(question)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      scores[rule.intent] += rule.weight;
      reasons[rule.intent].push(rule.reason);
    }
  }

  /*
   * Special combinations.
   *
   * These make the classifier less dependent on a single keyword.
   */

  // "setelah bayar ..." usually means affordability / available money.
  if (
    /\bsetelah\b/i.test(question) &&
    (/\bbayar\b/i.test(question) || /\bpengeluaran\b/i.test(question))
  ) {
    scores.AFFORDABILITY += 3;
    reasons.AFFORDABILITY.push(
      "Pertanyaan mempertimbangkan kondisi uang setelah kewajiban atau pengeluaran."
    );
  }

  // Questions containing "bulan ini" + spending terms are stronger spending questions.
  if (
    /\bbulan ini\b/i.test(question) &&
    (/\bpengeluaran\b/i.test(question) ||
      /\bhabis\b/i.test(question) ||
      /\bbelanja\b/i.test(question))
  ) {
    scores.SPENDING += 2;
    reasons.SPENDING.push(
      "Pertanyaan membandingkan atau mengevaluasi pengeluaran pada periode berjalan."
    );
  }

  // "sisa" + budget/category indicates budget.
  if (
    /\bsisa\b/i.test(question) &&
    (/\bbudget\b/i.test(question) || /\banggaran\b/i.test(question))
  ) {
    scores.BUDGET += 3;
    reasons.BUDGET.push(
      "Pertanyaan meminta sisa batas pengeluaran."
    );
  }

  // "target" + amount/deadline strongly indicates goal.
  if (
    /\btarget\b/i.test(question) &&
    (/\brp\b/i.test(question) ||
      /\brupiah\b/i.test(question) ||
      /\bdeadline\b/i.test(question) ||
      /\btanggal\b/i.test(question))
  ) {
    scores.GOAL += 2;
    reasons.GOAL.push(
      "Pertanyaan membahas target nominal atau batas waktu."
    );
  }

  return {
    scores,
    reasons,
  };
}

export function classifyIntent(question: string): IntentClassification {
  const normalizedQuestion = normalizeQuestion(question);

  if (!normalizedQuestion) {
    return {
      intent: "GENERAL",
      confidence: 0,
      requiredContext: CONTEXT_BY_INTENT.GENERAL,
      reasons: ["Pertanyaan kosong."],
    };
  }

  const { scores, reasons } = calculateIntentScores(normalizedQuestion);

  const ranked = Object.entries(scores).sort(
    ([, scoreA], [, scoreB]) => scoreB - scoreA
  );

  const [topIntent, topScore] = ranked[0] as [AIIntent, number];
  const [, secondScore] = ranked[1] as [AIIntent, number];

  /*
   * If there is no meaningful signal, treat it as GENERAL.
   */
  if (topScore === 0) {
    return {
      intent: "GENERAL",
      confidence: 0.3,
      requiredContext: CONTEXT_BY_INTENT.GENERAL,
      reasons: ["Tidak ditemukan sinyal intent yang cukup spesifik."],
    };
  }

  /*
   * Confidence is intentionally approximate.
   * It is used to understand classifier certainty,
   * not as a machine-learning probability.
   */
  const scoreGap = Math.max(topScore - secondScore, 0);

  const confidence = Math.min(
    0.95,
    Math.max(
      0.45,
      0.55 + topScore * 0.04 + scoreGap * 0.03
    )
  );

  const intent = topIntent;

  return {
    intent,
    confidence: Number(confidence.toFixed(2)),
    requiredContext: CONTEXT_BY_INTENT[intent],
    reasons: reasons[intent].length
      ? reasons[intent]
      : ["Intent dipilih berdasarkan skor sinyal pertanyaan."],
  };
}

export function getRequiredContext(
  intent: AIIntent
): AIContextKey[] {
  return CONTEXT_BY_INTENT[intent];
}