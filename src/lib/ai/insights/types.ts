export type InsightSeverity =
  | "INFO"
  | "WARNING"
  | "CRITICAL";

export type InsightType =
  | "BUDGET_WARNING"
  | "BUDGET_EXCEEDED"
  | "SPENDING_SPIKE"
  | "UPCOMING_EXPENSE"
  | "NEGATIVE_AVAILABLE_BALANCE"
  | "GOAL_BEHIND"
  | "NEGATIVE_CASHFLOW";

export type Insight = {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};