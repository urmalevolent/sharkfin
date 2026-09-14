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

function getWelcomeMessage(
  userName: string,
): Message {
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

      // Tutup mobile drawer setelah memilih conversation
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

      // ====================================================
      // JIKA CONVERSATION YANG DIHAPUS SEDANG AKTIF
      // ====================================================

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

    // ======================================================
    // ADD USER MESSAGE TO UI
    // ======================================================

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
      // ====================================================
      // SEND TO SHARKFIN API
      // ====================================================

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

      // ====================================================
      // HANDLE API ERROR
      // ====================================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mendapatkan jawaban dari SharkFin.",
        );
      }

      // ====================================================
      // SAVE CONVERSATION ID
      // ====================================================

      if (
        typeof data.conversationId ===
        "string"
      ) {
        setConversationId(
          data.conversationId,
        );
      }

      // ====================================================
      // ADD ASSISTANT MESSAGE
      // ====================================================

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

      // ====================================================
      // REFRESH CONVERSATION LIST
      // ====================================================

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
  // RENDER
  // ========================================================

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="border-b bg-background px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-xl font-semibold">
              Ask SharkFin
            </h1>

            <p className="text-sm text-muted-foreground">
              Teman AI untuk memahami
              keuanganmu
            </p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* MAIN */}
      {/* ================================================== */}

      <div className="flex min-h-0 flex-1">
        {/* ================================================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ================================================= */}

        <aside className="hidden w-72 shrink-0 border-r bg-muted/20 md:flex md:flex-col">
          <div className="border-b p-4">
            <button
              type="button"
              onClick={
                startNewConversation
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              <Plus className="h-4 w-4" />

              New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Conversations
            </div>

            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length ===
              0 ? (
              <div className="px-2 py-8 text-center">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />

                <p className="text-sm text-muted-foreground">
                  Belum ada percakapan.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
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
                        className={`group relative rounded-xl transition ${
                          isActive
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        }`}
                      >
                        {/* NORMAL ROW */}

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
                              className={`min-w-0 flex-1 rounded-xl px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isActive
                                  ? "text-primary"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />

                                <div className="min-w-0 flex-1 pr-1">
                                  <p className="truncate text-sm font-medium">
                                    {conversation.title ||
                                      "Percakapan Baru"}
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {conversation
                                      ._count
                                      ?.messages ??
                                      0}{" "}
                                    pesan
                                  </p>
                                </div>
                              </div>
                            </button>

                            {/* ACTION BUTTON */}

                            <button
                              type="button"
                              aria-label="Conversation actions"
                              onClick={(event) => {
                                event.stopPropagation();

                                toggleConversationMenu(
                                  conversation.id,
                                );
                              }}
                              disabled={
                                isDeletingConversation
                              }
                              className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          /* RENAME MODE */

                          <div className="p-2">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(event) =>
                                setEditingTitle(
                                  event.target.value,
                                )
                              }
                              onKeyDown={(event) => {
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
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                            />

                            <div className="mt-2 flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={
                                  cancelRenameConversation
                                }
                                disabled={
                                  isSavingTitle
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                                aria-label="Batal rename"
                              >
                                <X className="h-4 w-4" />
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
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Simpan rename"
                              >
                                {isSavingTitle ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ACTION MENU */}

                        {isMenuOpen &&
                          !isEditing && (
                            <div
                              className="absolute right-2 top-11 z-50 w-40 overflow-hidden rounded-xl border bg-background p-1 shadow-lg"
                              onClick={(event) =>
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
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
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
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
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
        </aside>

        {/* ================================================= */}
        {/* CHAT AREA */}
        {/* ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* ================================================= */}
          {/* MOBILE HEADER */}
          {/* ================================================= */}

          <div className="flex items-center gap-2 border-b bg-background px-3 py-3 md:hidden">
            <button
              type="button"
              onClick={() =>
                setIsMobileConversationsOpen(
                  true,
                )
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-muted"
              aria-label="Buka conversation history"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {activeConversation?.title ||
                  "Ask SharkFin"}
              </p>

              <p className="truncate text-xs text-muted-foreground">
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-muted"
              aria-label="New conversation"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* ================================================= */}
          {/* MOBILE CONVERSATION DRAWER */}
          {/* ================================================= */}

          {isMobileConversationsOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* BACKDROP */}

              <button
                type="button"
                aria-label="Tutup conversation history"
                onClick={() =>
                  setIsMobileConversationsOpen(
                    false,
                  )
                }
                className="absolute inset-0 bg-black/40"
              />

              {/* DRAWER */}

              <aside className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col border-r bg-background shadow-xl">
                {/* DRAWER HEADER */}

                <div className="flex items-center justify-between border-b px-4 py-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold">
                      Conversations
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Riwayat percakapan SharkFin
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsMobileConversationsOpen(
                        false,
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-muted"
                    aria-label="Tutup"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* NEW CONVERSATION */}

                <div className="border-b p-3">
                  <button
                    type="button"
                    onClick={
                      startNewConversation
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />

                    New Conversation
                  </button>
                </div>

                {/* CONVERSATION LIST */}

                <div className="flex-1 overflow-y-auto p-3">
                  {isLoadingConversations ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations.length ===
                    0 ? (
                    <div className="px-3 py-10 text-center">
                      <MessageSquare className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" />

                      <p className="text-sm font-medium">
                        Belum ada percakapan
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Mulai percakapan baru
                        dengan SharkFin.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map(
                        (
                          conversation,
                        ) => {
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
                              className={`group relative rounded-xl transition ${
                                isActive
                                  ? "bg-primary/10"
                                  : "hover:bg-muted"
                              }`}
                            >
                              {/* NORMAL ROW */}

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
                                    className={`min-w-0 flex-1 rounded-xl px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                      isActive
                                        ? "text-primary"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />

                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                          {conversation.title ||
                                            "Percakapan Baru"}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                          {conversation
                                            ._count
                                            ?.messages ??
                                            0}{" "}
                                          pesan
                                        </p>
                                      </div>
                                    </div>
                                  </button>

                                  {/* MOBILE ACTION BUTTON */}

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
                                    className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                /* RENAME MODE */

                                <div className="p-2">
                                  <input
                                    type="text"
                                    value={
                                      editingTitle
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      setEditingTitle(
                                        event
                                          .target
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
                                    maxLength={
                                      100
                                    }
                                    autoFocus
                                    disabled={
                                      isSavingTitle
                                    }
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                                  />

                                  <div className="mt-2 flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={
                                        cancelRenameConversation
                                      }
                                      disabled={
                                        isSavingTitle
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                                      aria-label="Batal rename"
                                    >
                                      <X className="h-4 w-4" />
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
                                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                      aria-label="Simpan rename"
                                    >
                                      {isSavingTitle ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* MOBILE ACTION MENU */}

                              {isMenuOpen &&
                                !isEditing && (
                                  <div
                                    className="absolute right-2 top-11 z-50 w-40 overflow-hidden rounded-xl border bg-background p-1 shadow-lg"
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
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
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
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
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
              </aside>
            </div>
          )}

          {/* ================================================= */}
          {/* CHAT */}
          {/* ================================================= */}

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
              {isLoadingConversation ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Memuat conversation...
                  </div>
                </div>
              ) : (
                messages.map(
                  (message) => {
                    const isUser =
                      message.role ===
                      "user";

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {/* ASSISTANT AVATAR */}

                        {!isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                        )}

                        {/* MESSAGE */}

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
                            isUser
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md border bg-card"
                          }`}
                        >
                          {message.content
                            .split("\n")
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

                        {/* USER AVATAR */}

                        {isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    );
                  },
                )
              )}

              {/* ================================================= */}
              {/* LOADING */}
              {/* ================================================= */}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>

                  <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />

                      SharkFin sedang
                      menganalisis...
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* AUTO SCROLL ANCHOR */}
              {/* ================================================= */}

              <div
                ref={messagesEndRef}
                className="h-px"
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* BOTTOM AREA */}
          {/* ================================================= */}

          <div className="border-t bg-background">
            <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-4">
              {/* ================================================= */}
              {/* QUICK QUESTIONS */}
              {/* ================================================= */}

              {messages.length === 1 &&
                !isLoadingConversation && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />

                      Coba tanyakan
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
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
                              className="flex shrink-0 items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Icon className="h-4 w-4 text-muted-foreground" />

                              {
                                item.label
                              }
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

              {/* ================================================= */}
              {/* INPUT */}
              {/* ================================================= */}

              <form
                onSubmit={sendQuestion}
                className="relative"
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
                  className="min-h-[58px] w-full resize-none rounded-2xl border bg-card py-4 pl-4 pr-14 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {/* SEND BUTTON */}

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

              {/* DISCLAIMER */}

              <p className="mt-2 text-center text-xs text-muted-foreground">
                SharkFin menggunakan data
                keuanganmu untuk memberikan
                analisis yang lebih relevan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}