import {
  buildAIContext,
} from "@/lib/ai/context";

export async function getAIContext(
  userId: string,
  user: {
    name: string;
  },
) {
  return buildAIContext(
    userId,
    user,
  );
}