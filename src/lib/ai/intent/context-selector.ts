import type { AIContext } from "@/lib/ai/context";
import type {
  AIContextKey,
  IntentClassification,
} from "./types";

type SelectedAIContext = Partial<AIContext>;

export function selectAIContext(
  context: AIContext,
  classification: IntentClassification
): SelectedAIContext {
  const selected: Record<string, unknown> = {};

  for (const key of classification.requiredContext) {
    if (key in context) {
      selected[key] = context[key as keyof AIContext];
    }
  }

  /*
   * User name is useful for natural responses.
   * We keep it available regardless of intent.
   */
  if (!("user" in selected) && context.user) {
    selected.user = context.user;
  }

  return selected as SelectedAIContext;
}

export function getSelectedContextKeys(
  classification: IntentClassification
): AIContextKey[] {
  return classification.requiredContext;
}