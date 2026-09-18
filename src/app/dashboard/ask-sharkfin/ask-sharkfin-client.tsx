"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

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
  Plus,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Menu,
  ChevronRight,
  Brain,
  ShieldCheck,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
};

type ConversationMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  responseId: string | null;
  createdAt: string;
};

type Props = {
  userName: string;
};

const quickQuestions = [
  {
    label: "Bagaimana kondisi keuangan saya?",
    description: "Lihat gambaran keuanganmu",
    icon: Wallet,
  },
  {
    label: "Apa pengeluaran terbesar saya?",
    description: "Analisis pola pengeluaran",
    icon: ShoppingBag,
  },
  {
    label: "Apakah saya masih bisa mencapai goal saya?",
    description: "Cek progres financial goal",
    icon: Target,
  },
  {
    label: "Apa pengeluaran saya yang akan datang?",
    description: "Lihat kewajiban terdekat",
    icon: CalendarDays,
  },
  {
    label: "Apa yang sebaiknya saya lakukan dengan uang saya?",
    description: "Dapatkan rekomendasi",
    icon: TrendingUp,
  },
];

function getWelcomeMessage(userName: string): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: `Halo, ${userName}! 👋\n\nSaya SharkFin. Saya bisa membantu kamu memahami kondisi keuangan, pengeluaran, budget, goals, dan rencana keuanganmu berdasarkan data yang ada di SharkFin.\n\nAda yang ingin kamu tanyakan?`,
  };
}

export default function AskSharkFinClient({
  userName,
}: Props) {
  // ========================================================
  // CONVERSATION
  // ========================================================

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [isLoadingConversations, setIsLoadingConversations] =
    useState(true);

  const [isLoadingConversation, setIsLoadingConversation] =
    useState(false);

  // ========================================================
  // MOBILE CONVERSATION DRAWER
  // ========================================================

  const [
    isMobileConversationsOpen,
    setIsMobileConversationsOpen,
  ] = useState(false);

  // ========================================================
  // AUTO SCROLL
  // ========================================================

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // ========================================================
  // CONVERSATION ACTIONS
  // ========================================================

  const [openConversationMenu, setOpenConversationMenu] =
    useState<string | null>(null);

  const [editingConversationId, setEditingConversationId] =
    useState<string | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const [isSavingTitle, setIsSavingTitle] =
    useState(false);

  const [isDeletingConversation, setIsDeletingConversation] =
    useState(false);

  // ========================================================
  // MESSAGES
  // ========================================================

  const [messages, setMessages] = useState<Message[]>([
    getWelcomeMessage(userName),
  ]);

  // ========================================================
  // INPUT STATE
  // ========================================================

  const [question, setQuestion] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  // ========================================================
  // AUTO SCROLL EFFECT
  // ========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages,
    isLoading,
    isLoadingConversation,
  ]);

  // ========================================================
  // LOAD CONVERSATIONS
  // ========================================================

  async function loadConversations(
    selectLatest = true,
  ) {
    try {
      setIsLoadingConversations(true);

      const response = await fetch(
        "/api/ai/conversations",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mengambil conversation.",
        );
      }

      const loadedConversations: Conversation[] =
        Array.isArray(
          data.conversations,
        )
          ? data.conversations
          : [];

      setConversations(
        loadedConversations,
      );

      if (
        selectLatest &&
        loadedConversations.length > 0
      ) {
        await loadConversation(
          loadedConversations[0].id,
        );
      }
    } catch (error) {
      console.error(
        "Load Conversations Error:",
        error,
      );
    } finally {
      setIsLoadingConversations(false);
    }
  }

  // ========================================================
  // LOAD SINGLE CONVERSATION
  // ========================================================

  async function loadConversation(
    id: string,
  ) {
    try {
      setIsLoadingConversation(true);

      setIsMobileConversationsOpen(false);

      setOpenConversationMenu(null);
      setEditingConversationId(null);
      setEditingTitle("");

      const response = await fetch(
        `/api/ai/conversations/${id}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mengambil conversation.",
        );
      }

      const conversation =
        data.conversation;

      if (!conversation) {
        throw new Error(
          "Conversation tidak ditemukan.",
        );
      }

      setConversationId(
        conversation.id,
      );

      const loadedMessages: Message[] =
        Array.isArray(
          conversation.messages,
        )
          ? conversation.messages.map(
              (
                message: ConversationMessage,
              ) => ({
                id: message.id,
                role:
                  message.role ===
                  "USER"
                    ? "user"
                    : "assistant",
                content:
                  message.content,
              }),
            )
          : [];

      if (
        loadedMessages.length > 0
      ) {
        setMessages(
          loadedMessages,
        );
      } else {
        setMessages([
          getWelcomeMessage(
            userName,
          ),
        ]);
      }
    } catch (error) {
      console.error(
        "Load Conversation Error:",
        error,
      );

      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Maaf, conversation gagal dimuat. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoadingConversation(false);
    }
  }

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadConversations(true);
  }, []);

  // ========================================================
  // NEW CHAT
  // ========================================================

  function startNewConversation() {
    setConversationId(null);

    setMessages([
      getWelcomeMessage(userName),
    ]);

    setQuestion("");

    setOpenConversationMenu(null);
    setEditingConversationId(null);
    setEditingTitle("");

    setIsMobileConversationsOpen(
      false,
    );
  }

  // ========================================================
  // OPEN / CLOSE CONVERSATION MENU
  // ========================================================

  function toggleConversationMenu(
    id: string,
  ) {
    setEditingConversationId(null);

    setOpenConversationMenu(
      (previous) =>
        previous === id
          ? null
          : id,
    );
  }

  // ========================================================
  // START RENAME
  // ========================================================

  function startRenameConversation(
    conversation: Conversation,
  ) {
    setOpenConversationMenu(null);

    setEditingConversationId(
      conversation.id,
    );

    setEditingTitle(
      conversation.title ||
        "Percakapan Baru",
    );
  }

  // ========================================================
  // CANCEL RENAME
  // ========================================================

  function cancelRenameConversation() {
    setEditingConversationId(null);
    setEditingTitle("");
  }

  // ========================================================
  // SAVE RENAME
  // ========================================================

  async function saveConversationTitle(
    id: string,
  ) {
    const title =
      editingTitle.trim();

    if (!title) {
      return;
    }

    if (title.length > 100) {
      return;
    }

    try {
      setIsSavingTitle(true);

      const response = await fetch(
        `/api/ai/conversations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mengubah nama conversation.",
        );
      }

      const updatedConversation =
        data.conversation;

      setConversations(
        (previous) =>
          previous.map(
            (conversation) =>
              conversation.id === id
                ? {
                    ...conversation,
                    title:
                      updatedConversation
                        ?.title ??
                      title,
                  }
                : conversation,
          ),
      );

      setEditingConversationId(null);
      setEditingTitle("");
    } catch (error) {
      console.error(
        "Rename Conversation Error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengubah nama conversation.",
      );
    } finally {
      setIsSavingTitle(false);
    }
  }

  // ========================================================
  // DELETE CONVERSATION
  // ========================================================

  async function deleteConversation(
    id: string,
  ) {
    const conversation =
      conversations.find(
        (item) => item.id === id,
      );

    const conversationTitle =
      conversation?.title ||
      "Percakapan Baru";

    const confirmed =
      window.confirm(
        `Apakah kamu yakin ingin menghapus conversation "${conversationTitle}"?\n\nSemua pesan dalam conversation ini juga akan dihapus.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingConversation(
        true,
      );

      setOpenConversationMenu(null);

      const response = await fetch(
        `/api/ai/conversations/${id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal menghapus conversation.",
        );
      }

      const remainingConversations =
        conversations.filter(
          (conversation) =>
            conversation.id !== id,
        );

      setConversations(
        remainingConversations,
      );

      if (conversationId === id) {
        if (
          remainingConversations.length >
          0
        ) {
          await loadConversation(
            remainingConversations[0].id,
          );
        } else {
          startNewConversation();
        }
      }
    } catch (error) {
      console.error(
        "Delete Conversation Error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus conversation.",
      );
    } finally {
      setIsDeletingConversation(
        false,
      );
    }
  }

  // ========================================================
  // SEND QUESTION
  // ========================================================

  async function sendQuestion(
    event?: FormEvent<HTMLFormElement>,
    selectedQuestion?: string,
  ) {
    event?.preventDefault();

    const text = (
      selectedQuestion ?? question
    ).trim();

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
      const response = await fetch(
        "/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            conversationId,
            question: text,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mendapatkan jawaban dari SharkFin.",
        );
      }

      if (
        typeof data.conversationId ===
        "string"
      ) {
        setConversationId(
          data.conversationId,
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

      await loadConversations(
        false,
      );
    } catch (error) {
      console.error(
        "Ask SharkFin Error:",
        error,
      );

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

  // ========================================================
  // ACTIVE CONVERSATION
  // ========================================================

  const activeConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        conversationId,
    );

  // ========================================================
  // CONVERSATION LIST
  // ========================================================

  function ConversationList({
    mobile = false,
  }: {
    mobile?: boolean;
  }) {
    return (
      <div className="flex h-full flex-col">
        {/* LIST HEADER */}

        {!mobile && (
          <div className="border-b px-4 py-4">
            <button
              type="button"
              onClick={
                startNewConversation
              }
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />

              New Conversation
            </button>
          </div>
        )}

        {mobile && (
          <div className="border-b p-3">
            <button
              type="button"
              onClick={
                startNewConversation
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />

              New Conversation
            </button>
          </div>
        )}

        {/* LIST */}

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 flex items-center justify-between px-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Conversations
              </p>

              {conversations.length >
                0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {conversations.length}{" "}
                  percakapan
                </p>
              )}
            </div>

            <MessageSquare className="h-4 w-4 text-muted-foreground/60" />
          </div>

          {isLoadingConversations ? (
            <div className="space-y-2">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-transparent p-3"
                >
                  <div className="flex gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-muted" />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-muted" />

                      <div className="h-2.5 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed bg-background/60 px-4 py-10 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>

              <p className="text-sm font-semibold">
                Belum ada percakapan
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Mulai percakapan baru
                dengan SharkFin.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map(
                (conversation) => {
                  const isActive =
                    conversation.id ===
                    conversationId;

                  const isEditing =
                    editingConversationId ===
                    conversation.id;

                  const isMenuOpen =
                    openConversationMenu ===
                    conversation.id;

                  return (
                    <div
                      key={
                        conversation.id
                      }
                      className={`group relative rounded-xl border transition-all ${
                        isActive
                          ? "border-primary/20 bg-primary/10 shadow-sm"
                          : "border-transparent hover:border-border hover:bg-background"
                      }`}
                    >
                      {!isEditing ? (
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() =>
                              loadConversation(
                                conversation.id,
                              )
                            }
                            disabled={
                              isLoadingConversation ||
                              isDeletingConversation
                            }
                            className="min-w-0 flex-1 px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`truncate text-sm font-medium ${
                                    isActive
                                      ? "text-primary"
                                      : "text-foreground"
                                  }`}
                                >
                                  {conversation.title ||
                                    "Percakapan Baru"}
                                </p>

                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground">
                                    {conversation
                                      ._count
                                      ?.messages ??
                                      0}{" "}
                                    pesan
                                  </span>

                                  {isActive && (
                                    <>
                                      <span className="h-1 w-1 rounded-full bg-primary/60" />

                                      <span className="text-[10px] font-medium text-primary">
                                        Aktif
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <ChevronRight
                                className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform ${
                                  isActive
                                    ? "translate-x-0 text-primary"
                                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                }`}
                              />
                            </div>
                          </button>

                          <button
                            type="button"
                            aria-label="Conversation actions"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              toggleConversationMenu(
                                conversation.id,
                              );
                            }}
                            disabled={
                              isDeletingConversation
                            }
                            className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Pencil className="h-4 w-4 shrink-0 text-primary" />

                            <span className="text-xs font-medium">
                              Rename conversation
                            </span>
                          </div>

                          <input
                            type="text"
                            value={
                              editingTitle
                            }
                            onChange={(
                              event,
                            ) =>
                              setEditingTitle(
                                event.target
                                  .value,
                              )
                            }
                            onKeyDown={(
                              event,
                            ) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                event.preventDefault();

                                if (
                                  editingTitle.trim()
                                ) {
                                  saveConversationTitle(
                                    conversation.id,
                                  );
                                }
                              }

                              if (
                                event.key ===
                                "Escape"
                              ) {
                                cancelRenameConversation();
                              }
                            }}
                            maxLength={100}
                            autoFocus
                            disabled={
                              isSavingTitle
                            }
                            placeholder="Nama conversation..."
                            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                          />

                          <div className="mt-2 flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={
                                cancelRenameConversation
                              }
                              disabled={
                                isSavingTitle
                              }
                              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />

                              Batal
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                saveConversationTitle(
                                  conversation.id,
                                )
                              }
                              disabled={
                                !editingTitle.trim() ||
                                isSavingTitle
                              }
                              className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isSavingTitle ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}

                              Simpan
                            </button>
                          </div>
                        </div>
                      )}

                      {isMenuOpen &&
                        !isEditing && (
                          <div
                            className="absolute right-2 top-12 z-50 w-40 overflow-hidden rounded-xl border bg-background p-1.5 shadow-xl"
                            onClick={(
                              event,
                            ) =>
                              event.stopPropagation()
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                startRenameConversation(
                                  conversation,
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />

                              Rename
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteConversation(
                                  conversation.id,
                                )
                              }
                              disabled={
                                isDeletingConversation
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                            >
                              {isDeletingConversation ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

                              Delete
                            </button>
                          </div>
                        )}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR FOOTER */}

        {!mobile && (
          <div className="border-t p-3">
            <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />

              <p className="text-[11px] leading-4 text-muted-foreground">
                Percakapanmu digunakan
                untuk memberikan konteks
                yang lebih relevan.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden bg-muted/20">
      {/* ================================================== */}
      {/* DESKTOP / GLOBAL HEADER */}
      {/* ================================================== */}

      <header className="shrink-0 border-b bg-background">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Bot className="h-6 w-6 text-primary-foreground" />

              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                  Ask SharkFin
                </h1>

                <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 sm:inline-flex">
                  AI Assistant
                </span>
              </div>

              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                Teman AI untuk memahami dan
                mengelola keuanganmu
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 sm:flex">
            <Sparkles className="h-4 w-4 text-primary" />

            <div>
              <p className="text-xs font-medium">
                SharkFin AI
              </p>

              <p className="text-[10px] text-muted-foreground">
                Analisis berdasarkan data
                keuanganmu
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* MAIN WORKSPACE */}
      {/* ================================================== */}

      <div className="flex min-h-0 flex-1">
        {/* ================================================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ================================================= */}

        <aside className="hidden w-72 shrink-0 border-r bg-background lg:flex lg:flex-col">
          <ConversationList />
        </aside>

        {/* ================================================= */}
        {/* CHAT AREA */}
        {/* ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* ================================================= */}
          {/* MOBILE CHAT HEADER */}
          {/* ================================================= */}

          <div className="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-3 lg:hidden">
            <button
              type="button"
              onClick={() =>
                setIsMobileConversationsOpen(
                  true,
                )
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Buka conversation history"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {activeConversation?.title ||
                    "Ask SharkFin"}
                </p>

                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              </div>

              <p className="truncate text-[11px] text-muted-foreground">
                {conversationId
                  ? `${activeConversation?._count?.messages ?? messages.length} pesan`
                  : "Percakapan baru"}
              </p>
            </div>

            <button
              type="button"
              onClick={
                startNewConversation
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90"
              aria-label="New conversation"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* ================================================= */}
          {/* MOBILE DRAWER */}
          {/* ================================================= */}

          {isMobileConversationsOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <button
                type="button"
                aria-label="Tutup conversation history"
                onClick={() =>
                  setIsMobileConversationsOpen(
                    false,
                  )
                }
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              />

              <aside className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold">
                        SharkFin
                      </h2>

                      <p className="truncate text-xs text-muted-foreground">
                        Conversation history
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsMobileConversationsOpen(
                        false,
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Tutup"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <ConversationList mobile />
              </aside>
            </div>
          )}

          {/* ================================================= */}
          {/* CHAT MESSAGES */}
          {/* ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-8">
              {isLoadingConversation ? (
                <div className="flex flex-1 items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Memuat conversation...
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Menyiapkan percakapanmu
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ================================================= */}
                  {/* EMPTY / WELCOME STATE */}
                  {/* ================================================= */}

                  {messages.length ===
                    1 &&
                    messages[0].id ===
                      "welcome" && (
                      <div className="mb-8 flex flex-1 flex-col justify-center">
                        <div className="mx-auto w-full max-w-2xl">
                          <div className="mb-8 text-center">
                            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                              <Bot className="h-8 w-8 text-primary-foreground" />

                              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-background">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                              </div>
                            </div>

                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                              SharkFin AI
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                              Apa yang ingin kamu
                              ketahui?
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                              Tanya tentang kondisi
                              keuangan, pengeluaran,
                              budget, goals, atau
                              rencana pembelianmu.
                              SharkFin akan
                              menganalisis berdasarkan
                              data keuanganmu.
                            </p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {quickQuestions.map(
                              (item) => {
                                const Icon =
                                  item.icon;

                                return (
                                  <button
                                    key={
                                      item.label
                                    }
                                    type="button"
                                    disabled={
                                      isLoading
                                    }
                                    onClick={() =>
                                      sendQuestion(
                                        undefined,
                                        item.label,
                                      )
                                    }
                                    className="group flex items-start gap-3 rounded-2xl border bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                      <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold leading-5">
                                        {
                                          item.label
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {
                                          item.description
                                        }
                                      </p>
                                    </div>

                                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                  </button>
                                );
                              },
                            )}
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Brain className="h-3.5 w-3.5 text-primary" />
                              Analisis berbasis
                              data
                            </span>

                            <span className="h-1 w-1 rounded-full bg-border" />

                            <span className="inline-flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              Keuangan tetap
                              dalam kendali kamu
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* ================================================= */}
                  {/* MESSAGE LIST */}
                  {/* ================================================= */}

                  <div
                    className={`space-y-6 ${
                      messages.length ===
                        1 &&
                      messages[0].id ===
                        "welcome"
                        ? "hidden"
                        : ""
                    }`}
                  >
                    {messages.map(
                      (message) => {
                        const isUser =
                          message.role ===
                          "user";

                        return (
                          <div
                            key={
                              message.id
                            }
                            className={`flex gap-3 sm:gap-4 ${
                              isUser
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {/* ASSISTANT AVATAR */}

                            {!isUser && (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                                <Bot className="h-4.5 w-4.5 text-primary-foreground" />
                              </div>
                            )}

                            {/* MESSAGE CONTENT */}

                            <div
                              className={`max-w-[88%] sm:max-w-[78%] ${
                                isUser
                                  ? "order-first"
                                  : ""
                              }`}
                            >
                              {!isUser && (
                                <div className="mb-1.5 flex items-center gap-2">
                                  <span className="text-xs font-semibold">
                                    SharkFin
                                  </span>

                                  <span className="h-1 w-1 rounded-full bg-emerald-500" />

                                  <span className="text-[10px] text-muted-foreground">
                                    AI Assistant
                                  </span>
                                </div>
                              )}

                              <div
                                className={`rounded-2xl px-4 py-3.5 text-sm leading-6 shadow-sm transition ${
                                  isUser
                                    ? "rounded-br-md bg-primary text-primary-foreground"
                                    : "rounded-bl-md border bg-background"
                                }`}
                              >
                                {message.content
                                  .split(
                                    "\n",
                                  )
                                  .map(
                                    (
                                      line,
                                      index,
                                    ) => (
                                      <p
                                        key={
                                          index
                                        }
                                        className={
                                          index >
                                          0
                                            ? "mt-2"
                                            : undefined
                                        }
                                      >
                                        {line ||
                                          "\u00A0"}
                                      </p>
                                    ),
                                  )}
                              </div>
                            </div>

                            {/* USER AVATAR */}

                            {isUser && (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm">
                                <User className="h-4.5 w-4.5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </>
              )}

              {/* ================================================= */}
              {/* AI LOADING */}
              {/* ================================================= */}

              {isLoading && (
                <div className="mt-6 flex gap-3 sm:gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                    <Bot className="h-4.5 w-4.5 text-primary-foreground" />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-xs font-semibold">
                        SharkFin
                      </span>

                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border bg-background px-4 py-3.5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                        </div>

                        <span className="text-xs text-muted-foreground">
                          SharkFin sedang
                          menganalisis...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* AUTO SCROLL */}
              {/* ================================================= */}

              <div
                ref={messagesEndRef}
                className="h-px"
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* COMPOSER */}
          {/* ================================================= */}

          <div className="shrink-0 border-t bg-background">
            <div className="mx-auto max-w-4xl px-4 pb-3 pt-3 sm:px-6 sm:pb-4">
              {/* QUICK QUESTIONS AFTER CHAT */}

              {messages.length >
                1 &&
                !isLoading && (
                  <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />

                    <button
                      type="button"
                      onClick={() =>
                        sendQuestion(
                          undefined,
                          "Bagaimana kondisi keuangan saya?",
                        )
                      }
                      className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      Kondisi keuangan
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        sendQuestion(
                          undefined,
                          "Apa pengeluaran terbesar saya?",
                        )
                      }
                      className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      Pengeluaran terbesar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        sendQuestion(
                          undefined,
                          "Apakah saya masih bisa mencapai goal saya?",
                        )
                      }
                      className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      Cek goal
                    </button>
                  </div>
                )}

              {/* INPUT CONTAINER */}

              <form
                onSubmit={sendQuestion}
                className="relative"
              >
                <div
                  className={`rounded-2xl border bg-card p-2 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 ${
                    isLoading
                      ? "opacity-70"
                      : ""
                  }`}
                >
                  <textarea
                    value={question}
                    onChange={(event) =>
                      setQuestion(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          "Enter" &&
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
                    className="min-h-[54px] w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                  />

                  <div className="flex items-center justify-between gap-3 px-2 pb-1">
                    <p className="hidden text-[10px] text-muted-foreground sm:block">
                      Enter untuk mengirim
                      • Shift + Enter untuk
                      baris baru
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      {question.length}/2000
                    </p>

                    <button
                      type="submit"
                      disabled={
                        !question.trim() ||
                        isLoading
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      aria-label="Kirim pertanyaan"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* DISCLAIMER */}

              <p className="mt-2.5 text-center text-[10px] leading-4 text-muted-foreground">
                SharkFin memberikan analisis
                berdasarkan data keuanganmu.
                Keputusan finansial tetap berada
                di tanganmu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}