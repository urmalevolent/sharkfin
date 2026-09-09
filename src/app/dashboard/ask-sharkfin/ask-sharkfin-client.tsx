"use client";

import { FormEvent, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Wallet,
  TrendingUp,
  Target,
  CalendarDays,
  ShoppingBag,
  Loader2,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  userName: string;
};

const quickQuestions = [
  {
    label: "Bagaimana kondisi keuangan saya?",
    icon: Wallet,
  },
  {
    label: "Apa pengeluaran terbesar saya?",
    icon: ShoppingBag,
  },
  {
    label: "Apakah saya masih bisa mencapai goal saya?",
    icon: Target,
  },
  {
    label: "Apa pengeluaran saya yang akan datang?",
    icon: CalendarDays,
  },
  {
    label: "Apa yang sebaiknya saya lakukan dengan uang saya?",
    icon: TrendingUp,
  },
];

export default function AskSharkFinClient({
  userName,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo, ${userName}! 👋\n\nSaya SharkFin. Saya bisa membantu kamu memahami kondisi keuangan, pengeluaran, budget, goals, dan rencana keuanganmu berdasarkan data yang ada di SharkFin.\n\nAda yang ingin kamu tanyakan?`,
    },
  ]);

  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendQuestion(
    event?: FormEvent<HTMLFormElement>,
    selectedQuestion?: string,
  ) {
    event?.preventDefault();

    const text = (selectedQuestion ?? question).trim();

    if (!text || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mendapatkan jawaban dari SharkFin.",
        );
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          data.answer ||
          "Maaf, SharkFin tidak memberikan jawaban.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Ask SharkFin Error:", error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Maaf, SharkFin sedang mengalami gangguan. Silakan coba lagi beberapa saat.",
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-xl font-semibold">
              Ask SharkFin
            </h1>

            <p className="text-sm text-muted-foreground">
              Teman AI untuk memahami keuanganmu
            </p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
          {messages.map((message) => {
            const isUser =
              message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    isUser
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border bg-card"
                  }`}
                >
                  {message.content
                    .split("\n")
                    .map((line, index) => (
                      <p
                        key={index}
                        className={
                          index > 0
                            ? "mt-2"
                            : undefined
                        }
                      >
                        {line || "\u00A0"}
                      </p>
                    ))}
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>

              <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  SharkFin sedang menganalisis...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="border-t bg-background">
        <div className="mx-auto max-w-5xl px-6 py-4">
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Coba tanyakan
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickQuestions.map(
                  (item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          sendQuestion(
                            undefined,
                            item.label,
                          )
                        }
                        className="flex shrink-0 items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={sendQuestion}
            className="relative"
          >
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  if (
                    question.trim() &&
                    !isLoading
                  ) {
                    sendQuestion();
                  }
                }
              }}
              placeholder="Tanyakan sesuatu tentang keuanganmu..."
              disabled={isLoading}
              rows={2}
              maxLength={2000}
              className="min-h-[58px] w-full resize-none rounded-2xl border bg-card py-4 pl-4 pr-14 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                !question.trim() ||
                isLoading
              }
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Kirim pertanyaan"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            SharkFin menggunakan data keuanganmu untuk
            memberikan analisis yang lebih relevan.
          </p>
        </div>
      </div>
    </div>
  );
}