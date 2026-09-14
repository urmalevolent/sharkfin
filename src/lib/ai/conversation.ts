type ConversationMessage = {
  role: "USER" | "ASSISTANT";
  content: string;
};

export function buildConversationHistory(
  messages: ConversationMessage[],
) {
  const recentMessages = messages.slice(-20);

  if (recentMessages.length === 0) {
    return "Belum ada percakapan sebelumnya.";
  }

  return recentMessages
    .map((message) => {
      const role =
        message.role === "USER"
          ? "USER"
          : "SHARKFIN";

      return `${role}: ${message.content}`;
    })
    .join("\n\n");
}