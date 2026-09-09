import type {
  Insight,
  InsightSeverity,
  InsightType,
} from "./types";

/*
 * ==========================================
 * INSIGHT PRIORITY
 * ==========================================
 *
 * Semakin tinggi nilainya, semakin penting
 * insight tersebut untuk ditampilkan terlebih
 * dahulu kepada user.
 *
 * Priority ini berbeda dengan severity.
 *
 * Severity:
 *   INFO / WARNING / CRITICAL
 *
 * Priority:
 *   seberapa penting insight tersebut
 *   dibandingkan insight lain.
 */

const SEVERITY_PRIORITY: Record<
  InsightSeverity,
  number
> = {
  CRITICAL: 300,
  WARNING: 200,
  INFO: 100,
};

const TYPE_PRIORITY: Record<
  InsightType,
  number
> = {
  NEGATIVE_AVAILABLE_BALANCE: 100,
  BUDGET_EXCEEDED: 90,
  NEGATIVE_CASHFLOW: 80,
  SPENDING_SPIKE: 70,
  BUDGET_WARNING: 60,
  GOAL_BEHIND: 50,
  UPCOMING_EXPENSE: 40,
};

type PrioritizedInsight = Insight & {
  priority: number;
};

type InsightPriorityResult = {
  primaryInsight: PrioritizedInsight | null;
  insights: PrioritizedInsight[];
};

/**
 * Menghitung priority sebuah insight.
 *
 * Severity menjadi faktor utama.
 * Type priority digunakan untuk menentukan
 * urutan ketika severity sama.
 */
function calculatePriority(
  insight: Insight,
): number {
  const severityPriority =
    SEVERITY_PRIORITY[
      insight.severity
    ];

  const typePriority =
    TYPE_PRIORITY[
      insight.type
    ];

  return (
    severityPriority +
    typePriority
  );
}

/**
 * Memberikan priority kepada seluruh insights
 * lalu mengurutkannya dari yang paling penting.
 */
export function prioritizeInsights(
  insights: Insight[],
): InsightPriorityResult {
  const prioritizedInsights =
    insights.map(
      (insight) => ({
        ...insight,
        priority:
          calculatePriority(
            insight,
          ),
      }),
    );

  prioritizedInsights.sort(
    (a, b) =>
      b.priority - a.priority,
  );

  return {
    primaryInsight:
      prioritizedInsights[0] ??
      null,

    insights:
      prioritizedInsights,
  };
}