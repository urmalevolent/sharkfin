export type AIIntent =
  | "BALANCE"
  | "CASHFLOW"
  | "SPENDING"
  | "BUDGET"
  | "GOAL"
  | "OBLIGATION"
  | "AFFORDABILITY"
  | "GENERAL";

export type AIContextKey =
  | "user"
  | "balance"
  | "cashflow"
  | "spending"
  | "budget"
  | "goals"
  | "obligations"
  | "forecast"
  | "financialHealth"
  | "insights";

export type IntentClassification = {
  intent: AIIntent;
  confidence: number;
  requiredContext: AIContextKey[];
  reasons: string[];
};