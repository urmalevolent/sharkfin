import {
  generateInsightTriggers,
  prioritizeInsights,
} from "@/lib/ai/insights";

import { getFinancialOverview } from "@/services/financial-engine.service";

export async function getUserInsights(
  userId: string,
) {
  /*
   * ==========================================
   * 1. Ambil Financial Overview
   * ==========================================
   *
   * Financial Engine tetap menjadi sumber
   * utama data finansial.
   */
  const financialData =
    await getFinancialOverview(
      userId,
    );

  /*
   * ==========================================
   * 2. Generate Insight Triggers
   * ==========================================
   *
   * Di tahap ini kita belum menggunakan LLM.
   *
   * Trigger Engine hanya mendeteksi kondisi
   * finansial berdasarkan aturan deterministic.
   */
  const triggeredInsights =
    generateInsightTriggers(
      financialData,
    );

  /*
   * ==========================================
   * 3. Prioritize Insights
   * ==========================================
   *
   * Semua insight diberikan priority dan
   * diurutkan berdasarkan tingkat kepentingan.
   */
  const {
    primaryInsight,
    insights,
  } = prioritizeInsights(
    triggeredInsights,
  );

  /*
   * ==========================================
   * 4. Return Result
   * ==========================================
   */

  return {
    generatedAt:
      new Date(),

    count:
      insights.length,

    primaryInsight,

    insights,
  };
}