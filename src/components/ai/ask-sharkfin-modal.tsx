"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  Bot,
  CalendarDays,
  Check,
  Loader2,
  Menu,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

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
  responseId?: string | null;
  createdAt: string;
};

type AskSharkFinModalProps = {
  open: boolean;
  userName: string;
  onClose: () => void;
};

/* =========================================================
   QUICK QUESTIONS
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function getWelcomeMessage(userName: string): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: `Halo, ${userName}! 👋

Saya SharkFin. Saya bisa membantu kamu memahami kondisi keuangan, pengeluaran, budget, goals, dan rencana keuanganmu berdasarkan data yang ada di SharkFin.

Ada yang ingin kamu tanyakan?`,
  };
}

function convertConversationMessages(
  messages: ConversationMessage[],
): Message[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role === "USER" ? "user" : "assistant",
    content: message.content,
  }));
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AskSharkFinModal({
  open,
  userName,
  onClose,
}: AskSharkFinModalProps) {
  /* =======================================================
     CONVERSATION STATE
  ======================================================= */

  const [conversationId, setConversationId] = useState<string | null>(null);

  const [conversationTitle, setConversationTitle] = useState("Percakapan Baru");

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [showHistory, setShowHistory] = useState(false);

  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  /* =======================================================
     MESSAGE STATE
  ======================================================= */

  const [messages, setMessages] = useState<Message[]>([
    getWelcomeMessage(userName),
  ]);

  const [question, setQuestion] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  /* =======================================================
     RENAME STATE
  ======================================================= */

  const [isRenaming, setIsRenaming] = useState(false);

  const [renameInput, setRenameInput] = useState("");

  const [isRenameSubmitting, setIsRenameSubmitting] = useState(false);

  /* =======================================================
     DELETE STATE
  ======================================================= */

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  /* =======================================================
     REFS
  ======================================================= */

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    if (!open) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading, open]);

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  /* =======================================================
     ESCAPE TO CLOSE
  ======================================================= */

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (showHistory) {
        setShowHistory(false);
        return;
      }

      if (
        isRenaming ||
        isDeleteOpen ||
        isLoading ||
        isLoadingConversation ||
        isCreatingConversation
      ) {
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    open,
    showHistory,
    isRenaming,
    isDeleteOpen,
    isLoading,
    isLoadingConversation,
    isCreatingConversation,
    onClose,
  ]);

  /* =======================================================
     LOAD CONVERSATIONS
  ======================================================= */

  async function loadConversations() {
    setIsLoadingConversations(true);

    try {
      const response = await fetch("/api/ai/conversations", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil percakapan.");
      }

      /*
       * IMPORTANT:
       *
       * API GET /api/ai/conversations
       * mengembalikan:
       *
       * {
       *   success: true,
       *   conversations: [...]
       * }
       *
       * Bukan result.data.
       */
      const data = Array.isArray(result.conversations)
        ? result.conversations
        : Array.isArray(result.data)
          ? result.data
          : [];

      setConversations(data);
    } catch (error) {
      console.error("Load conversations error:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }

  /* =======================================================
     LOAD CONVERSATION
  ======================================================= */

  async function loadConversation(id: string) {
    if (isLoadingConversation || isLoading || isCreatingConversation) {
      return;
    }

    setIsLoadingConversation(true);

    try {
      const response = await fetch(`/api/ai/conversations/${id}`, {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil percakapan.");
      }

      const conversation = result.data;

      if (!conversation) {
        throw new Error("Data percakapan tidak ditemukan.");
      }

      setConversationId(conversation.id);

      setConversationTitle(conversation.title || "Percakapan Baru");

      setMessages(
        conversation.messages?.length
          ? convertConversationMessages(conversation.messages)
          : [getWelcomeMessage(userName)],
      );

      setQuestion("");

      setShowHistory(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Load conversation error:", error);
    } finally {
      setIsLoadingConversation(false);
    }
  }

  /* =======================================================
     LOAD CONVERSATIONS WHEN MODAL OPENS
  ======================================================= */

  useEffect(() => {
    if (!open) return;

    loadConversations();
  }, [open]);

  /* =======================================================
     CREATE NEW CONVERSATION
  ======================================================= */

  async function startNewConversation() {
    if (isLoading || isLoadingConversation || isCreatingConversation) {
      return;
    }

    setIsCreatingConversation(true);

    try {
      /*
       * IMPORTANT:
       *
       * Sekarang "Percakapan Baru" benar-benar
       * membuat AIConversation di database.
       */
      const response = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal membuat percakapan baru.");
      }

      /*
       * API POST mengembalikan:
       *
       * {
       *   success: true,
       *   conversation: {...}
       * }
       */
      const conversation =
        result.conversation ?? result.data?.conversation ?? null;

      if (!conversation?.id) {
        throw new Error("Conversation baru tidak memiliki ID.");
      }

      const newConversation: Conversation = {
        id: conversation.id,
        title: conversation.title ?? "Percakapan Baru",
        createdAt: conversation.createdAt ?? new Date().toISOString(),
        updatedAt: conversation.updatedAt ?? new Date().toISOString(),
        _count: {
          messages: conversation._count?.messages ?? 0,
        },
      };

      /*
       * Masukkan conversation baru
       * ke history secara langsung.
       */
      setConversations((previous) => {
        const withoutDuplicate = previous.filter(
          (item) => item.id !== newConversation.id,
        );

        return [newConversation, ...withoutDuplicate];
      });

      /*
       * Jadikan conversation baru
       * sebagai conversation aktif.
       */
      setConversationId(newConversation.id);

      setConversationTitle(newConversation.title ?? "Percakapan Baru");

      /*
       * Conversation baru belum punya
       * pesan.
       */
      setMessages([getWelcomeMessage(userName)]);

      setQuestion("");

      setShowHistory(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Create new conversation error:", error);
    } finally {
      setIsCreatingConversation(false);
    }
  }

  /* =======================================================
     SEND QUESTION
  ======================================================= */

  async function sendQuestion(
    event?: FormEvent<HTMLFormElement>,
    selectedQuestion?: string,
  ) {
    event?.preventDefault();

    const text = (selectedQuestion ?? question).trim();

    if (!text || isLoading || isLoadingConversation || isCreatingConversation) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);

    setQuestion("");
    setIsLoading(true);

    try {
      /*
       * Jika conversationId null,
       * backend /api/ai/chat masih boleh
       * membuat conversation sendiri.
       *
       * Tetapi normalnya setelah tombol
       * "Percakapan Baru", conversationId
       * sudah tersedia.
       */
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          question: text,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mendapatkan jawaban dari SharkFin.",
        );
      }

      /*
       * Support beberapa kemungkinan
       * bentuk response API.
       */
      const newConversationId =
        result.conversationId ??
        result.data?.conversationId ??
        result.conversation?.id ??
        result.data?.conversation?.id ??
        null;

      const answer = result.answer ?? result.data?.answer ?? "";

      /*
       * Simpan conversationId hasil API.
       */
      if (typeof newConversationId === "string") {
        setConversationId(newConversationId);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer || "Maaf, SharkFin tidak memberikan jawaban.",
      };

      setMessages((previous) => [...previous, assistantMessage]);

      /*
       * Refresh history supaya:
       *
       * - conversation lama tetap ada
       * - conversation baru tetap ada
       * - jumlah pesan diperbarui
       * - updatedAt diperbarui
       */
      await loadConversations();
    } catch (error) {
      console.error("Ask SharkFin Error:", error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Maaf, SharkFin sedang mengalami gangguan. Silakan coba lagi beberapa saat.",
      };

      setMessages((previous) => [...previous, errorMessage]);
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }

  /* =======================================================
     RENAME CONVERSATION
  ======================================================= */

  function openRename() {
    if (!conversationId) return;

    setRenameInput(conversationTitle);

    setIsRenaming(true);
  }

  function closeRename() {
    if (isRenameSubmitting) return;

    setRenameInput("");
    setIsRenaming(false);
  }

  async function handleRename() {
    if (!conversationId) return;

    const title = renameInput.trim();

    if (!title) return;

    if (title.length > 100) return;

    setIsRenameSubmitting(true);

    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah nama percakapan.");
      }

      setConversationTitle(title);

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title,
                updatedAt: new Date().toISOString(),
              }
            : conversation,
        ),
      );

      closeRename();
    } catch (error) {
      console.error("Rename conversation error:", error);
    } finally {
      setIsRenameSubmitting(false);
    }
  }

  /* =======================================================
     DELETE CONVERSATION
  ======================================================= */

  function openDelete() {
    if (!conversationId) return;

    setIsDeleteOpen(true);
  }

  function closeDelete() {
    if (isDeleteSubmitting) return;

    setIsDeleteOpen(false);
  }

  async function handleDelete() {
    if (!conversationId) return;

    setIsDeleteSubmitting(true);

    try {
      const deletingId = conversationId;

      const response = await fetch(`/api/ai/conversations/${deletingId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus percakapan.");
      }

      setConversations((previous) =>
        previous.filter((conversation) => conversation.id !== deletingId),
      );

      /*
       * Setelah delete,
       * jangan membuat conversation
       * database baru secara otomatis.
       *
       * Kita hanya kembali ke state
       * "Percakapan Baru".
       */
      setConversationId(null);

      setConversationTitle("Percakapan Baru");

      setMessages([getWelcomeMessage(userName)]);

      setQuestion("");

      setIsDeleteOpen(false);
      setShowHistory(false);
    } catch (error) {
      console.error("Delete conversation error:", error);
    } finally {
      setIsDeleteSubmitting(false);
    }
  }

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function handleClose() {
    if (
      isLoading ||
      isLoadingConversation ||
      isCreatingConversation ||
      isRenameSubmitting ||
      isDeleteSubmitting
    ) {
      return;
    }

    setShowHistory(false);
    setIsRenaming(false);
    setIsDeleteOpen(false);

    onClose();
  }

  /* =======================================================
     RENDER
  ======================================================= */

  if (!open) {
    return null;
  }

  return (
    <>
      {/* ===================================================
          BACKDROP
      =================================================== */}

      <div
        className="
          fixed inset-0 z-[100]
          bg-slate-950/60
          backdrop-blur-sm
        "
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            handleClose();
          }
        }}
      />

      {/* ===================================================
          MODAL CONTAINER
      =================================================== */}

      <div
        className="
          fixed inset-0 z-[101]
          flex items-center justify-center
          p-0
          sm:p-4
          lg:p-6
        "
      >
        <div
          className="
            flex
            h-full
            w-full
            overflow-hidden
            bg-background
            shadow-2xl

            sm:h-[min(760px,calc(100vh-32px))]
            sm:max-w-5xl
            sm:rounded-2xl
            sm:border
          "
        >
          {/* =================================================
              HISTORY PANEL
          ================================================= */}

          {showHistory && (
            <>
              {/* Mobile overlay */}

              <button
                type="button"
                aria-label="Tutup riwayat"
                onClick={() => setShowHistory(false)}
                className="
                  fixed inset-0 z-[102]
                  bg-slate-950/40
                  lg:hidden
                "
              />

              {/* History */}

              <aside
                className="
                  fixed inset-y-0 left-0 z-[103]
                  flex w-[300px]
                  flex-col
                  border-r
                  bg-background
                  shadow-2xl

                  lg:static
                  lg:z-auto
                  lg:flex
                "
              >
                {/* History Header */}

                <div
                  className="
                    flex h-16 shrink-0
                    items-center justify-between
                    border-b px-4
                  "
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />

                    <div>
                      <p className="text-sm font-semibold">
                        Riwayat Percakapan
                      </p>

                      <p className="text-[11px] text-muted-foreground">
                        Percakapan SharkFin
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="
                      rounded-lg p-2
                      text-muted-foreground
                      transition
                      hover:bg-muted
                      hover:text-foreground
                    "
                    aria-label="Tutup riwayat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* New Conversation */}

                <div className="border-b p-3">
                  <button
                    type="button"
                    onClick={startNewConversation}
                    disabled={
                      isLoading ||
                      isLoadingConversation ||
                      isCreatingConversation
                    }
                    className="
                      flex w-full
                      items-center justify-center
                      gap-2
                      rounded-xl
                      border
                      bg-background
                      px-3 py-2.5
                      text-sm
                      font-medium
                      transition
                      hover:bg-muted
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isCreatingConversation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}

                    {isCreatingConversation ? "Membuat..." : "Percakapan Baru"}
                  </button>
                </div>

                {/* Conversation List */}

                <div className="flex-1 overflow-y-auto p-2">
                  {isLoadingConversations ? (
                    <div className="space-y-2 p-2">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="
                              h-14
                              animate-pulse
                              rounded-xl
                              bg-muted
                            "
                        />
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div
                      className="
                        flex h-full
                        flex-col
                        items-center
                        justify-center
                        px-5
                        text-center
                      "
                    >
                      <div
                        className="
                          flex h-12 w-12
                          items-center justify-center
                          rounded-full
                          bg-primary/10
                        "
                      >
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        Belum ada percakapan
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Percakapan yang kamu lakukan dengan SharkFin akan muncul
                        di sini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map((conversation) => {
                        const active = conversation.id === conversationId;

                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() => loadConversation(conversation.id)}
                            disabled={
                              isLoadingConversation ||
                              isLoading ||
                              isCreatingConversation
                            }
                            className={`
                                group flex w-full
                                items-start gap-3
                                rounded-xl
                                px-3 py-3
                                text-left
                                transition

                                ${
                                  active
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted"
                                }

                                disabled:cursor-not-allowed
                                disabled:opacity-60
                              `}
                          >
                            <MessageSquare
                              className={`
                                  mt-0.5
                                  h-4 w-4
                                  shrink-0

                                  ${
                                    active
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }
                                `}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {conversation.title || "Percakapan Baru"}
                              </p>

                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {conversation._count?.messages ?? 0} pesan
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>
            </>
          )}

          {/* =================================================
              MAIN CHAT
          ================================================= */}

          <div className="flex min-w-0 flex-1 flex-col">
            {/* =================================================
                HEADER
            ================================================= */}

            <header
              className="
                flex h-16 shrink-0
                items-center justify-between
                border-b
                bg-background
                px-4 sm:px-5
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                {/* History */}

                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="
                    flex h-9 w-9
                    shrink-0
                    items-center justify-center
                    rounded-xl
                    border
                    bg-background
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    hover:text-foreground
                  "
                  aria-label="Buka riwayat percakapan"
                >
                  <Menu className="h-4 w-4" />
                </button>

                {/* Icon */}

                <div
                  className="
                    flex h-9 w-9
                    shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-primary/10
                  "
                >
                  <Bot className="h-5 w-5 text-primary" />
                </div>

                {/* Title */}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold sm:text-base">
                      Ask SharkFin
                    </h2>

                    <span
                      className="
                        hidden
                        rounded-md
                        bg-primary/10
                        px-1.5 py-0.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-primary
                        sm:inline-block
                      "
                    >
                      AI
                    </span>
                  </div>

                  <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                    {conversationTitle}
                  </p>
                </div>
              </div>

              {/* Header Actions */}

              <div className="flex items-center gap-1">
                {conversationId && (
                  <>
                    {/* Rename */}

                    <button
                      type="button"
                      onClick={openRename}
                      disabled={isLoading}
                      className="
                        hidden
                        rounded-lg
                        p-2
                        text-muted-foreground
                        transition
                        hover:bg-muted
                        hover:text-foreground
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        sm:block
                      "
                      aria-label="Ubah nama percakapan"
                      title="Ubah nama"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={openDelete}
                      disabled={isLoading}
                      className="
                        hidden
                        rounded-lg
                        p-2
                        text-muted-foreground
                        transition
                        hover:bg-red-50
                        hover:text-red-600
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        sm:block
                      "
                      aria-label="Hapus percakapan"
                      title="Hapus percakapan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Close */}

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={
                    isLoading ||
                    isRenameSubmitting ||
                    isDeleteSubmitting ||
                    isLoadingConversation ||
                    isCreatingConversation
                  }
                  className="
                    rounded-xl
                    p-2
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    hover:text-foreground
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  aria-label="Tutup Ask SharkFin"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* =================================================
                MOBILE ACTIONS
            ================================================= */}

            {conversationId && (
              <div
                className="
                  flex items-center gap-2
                  border-b px-4 py-2
                  sm:hidden
                "
              >
                <button
                  type="button"
                  onClick={openRename}
                  disabled={isLoading}
                  className="
                    flex items-center gap-1.5
                    rounded-lg
                    px-2.5 py-1.5
                    text-xs
                    text-muted-foreground
                    transition
                    hover:bg-muted
                  "
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Ubah nama
                </button>

                <button
                  type="button"
                  onClick={openDelete}
                  disabled={isLoading}
                  className="
                    flex items-center gap-1.5
                    rounded-lg
                    px-2.5 py-1.5
                    text-xs
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            )}

            {/* =================================================
                CHAT CONTENT
            ================================================= */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                bg-muted/[0.15]
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  w-full
                  max-w-3xl
                  flex-col
                  gap-5
                  px-4 py-5
                  sm:px-6 sm:py-7
                "
              >
                {isLoadingConversation ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Membuka percakapan...
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={message.id}
                          className={`
                              flex gap-3
                              ${isUser ? "justify-end" : "justify-start"}
                            `}
                        >
                          {!isUser && (
                            <div
                              className="
                                  flex h-8 w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-primary/10
                                "
                            >
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}

                          <div
                            className={`
                                max-w-[85%]
                                rounded-2xl
                                px-4 py-3
                                text-sm
                                leading-6
                                shadow-sm

                                ${
                                  isUser
                                    ? `
                                      rounded-br-md
                                      bg-primary
                                      text-primary-foreground
                                    `
                                    : `
                                      rounded-bl-md
                                      border
                                      bg-card
                                    `
                                }
                              `}
                          >
                            {message.content.split("\n").map((line, index) => (
                              <p
                                key={index}
                                className={index > 0 ? "mt-2" : undefined}
                              >
                                {line || "\u00A0"}
                              </p>
                            ))}
                          </div>

                          {isUser && (
                            <div
                              className="
                                  flex h-8 w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-muted
                                "
                            >
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* AI Loading */}

                    {isLoading && (
                      <div className="flex gap-3">
                        <div
                          className="
                            flex h-8 w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-primary/10
                          "
                        >
                          <Bot className="h-4 w-4 text-primary" />
                        </div>

                        <div
                          className="
                            rounded-2xl
                            rounded-bl-md
                            border
                            bg-card
                            px-4 py-3
                          "
                        >
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            SharkFin sedang menganalisis...
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* =================================================
                COMPOSER
            ================================================= */}

            <div
              className="
                shrink-0
                border-t
                bg-background
              "
            >
              <div
                className="
                  mx-auto
                  w-full
                  max-w-3xl
                  px-4 py-3
                  sm:px-6 sm:py-4
                "
              >
                {/* Quick Questions */}

                {messages.length === 1 &&
                  !isLoading &&
                  !isLoadingConversation && (
                    <div className="mb-3">
                      <div
                        className="
                          mb-2
                          flex items-center gap-2
                          text-xs
                          font-medium
                          text-foreground
                        "
                      >
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Coba tanyakan
                      </div>

                      <div
                        className="
                          flex gap-2
                          overflow-x-auto
                          pb-1
                          scrollbar-thin
                        "
                      >
                        {quickQuestions.map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.label}
                              type="button"
                              disabled={isLoading || isCreatingConversation}
                              onClick={() =>
                                sendQuestion(undefined, item.label)
                              }
                              className="
                                  flex
                                  shrink-0
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  bg-card
                                  px-3 py-2
                                  text-xs
                                  transition
                                  hover:bg-muted
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                            >
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />

                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Input */}

                <form onSubmit={sendQuestion} className="relative">
                  <textarea
                    ref={inputRef}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();

                        if (
                          question.trim() &&
                          !isLoading &&
                          !isCreatingConversation &&
                          !isLoadingConversation
                        ) {
                          sendQuestion();
                        }
                      }
                    }}
                    placeholder="Tanyakan sesuatu tentang keuanganmu..."
                    disabled={
                      isLoading ||
                      isLoadingConversation ||
                      isCreatingConversation
                    }
                    rows={2}
                    maxLength={2000}
                    className="
                      min-h-[56px]
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      bg-card
                      py-3.5
                      pl-4
                      pr-14
                      text-sm
                      outline-none
                      transition

                      placeholder:text-muted-foreground

                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />

                  {/* Send */}

                  <button
                    type="submit"
                    disabled={
                      !question.trim() ||
                      isLoading ||
                      isLoadingConversation ||
                      isCreatingConversation
                    }
                    className="
                      absolute
                      bottom-2.5
                      right-2.5
                      flex
                      h-10 w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary
                      text-primary-foreground
                      transition
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                    aria-label="Kirim pertanyaan"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>

                {/* Disclaimer */}

                <p
                  className="
                    mt-2
                    text-center
                    text-[10px]
                    leading-4
                    text-muted-foreground
                    sm:text-xs
                  "
                >
                  SharkFin memberikan analisis berdasarkan data keuangan yang
                  tersedia di akunmu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          RENAME MODAL
      =================================================== */}

      {isRenaming && (
        <>
          <div className="fixed inset-0 z-[120] bg-slate-950/50" />

          <div
            className="
              fixed inset-0 z-[121]
              flex items-center justify-center
              p-4
            "
          >
            <div
              className="
                w-full max-w-md
                rounded-2xl
                border
                bg-background
                p-5
                shadow-2xl
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">
                    Ubah Nama Percakapan
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Berikan nama agar percakapan lebih mudah ditemukan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRename}
                  disabled={isRenameSubmitting}
                  className="
                    rounded-lg
                    p-2
                    text-muted-foreground
                    hover:bg-muted
                  "
                  aria-label="Tutup rename"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="conversation-title"
                  className="text-xs font-medium"
                >
                  Nama percakapan
                </label>

                <input
                  id="conversation-title"
                  value={renameInput}
                  onChange={(event) => setRenameInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();

                      if (renameInput.trim() && !isRenameSubmitting) {
                        handleRename();
                      }
                    }
                  }}
                  maxLength={100}
                  autoFocus
                  placeholder="Contoh: Rencana Keuangan September"
                  disabled={isRenameSubmitting}
                  className="
                    mt-2
                    h-11
                    w-full
                    rounded-xl
                    border
                    bg-background
                    px-3
                    text-sm
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Maksimal 100 karakter.
                </p>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeRename}
                  disabled={isRenameSubmitting}
                  className="
                    rounded-xl
                    border
                    px-4 py-2.5
                    text-sm
                    font-medium
                    transition
                    hover:bg-muted
                    disabled:opacity-50
                  "
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleRename}
                  disabled={!renameInput.trim() || isRenameSubmitting}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-primary
                    px-4 py-2.5
                    text-sm
                    font-medium
                    text-primary-foreground
                    transition
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isRenameSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {isDeleteOpen && (
        <>
          <div className="fixed inset-0 z-[120] bg-slate-950/50" />

          <div
            className="
              fixed inset-0 z-[121]
              flex items-center justify-center
              p-4
            "
          >
            <div
              className="
                w-full max-w-md
                rounded-2xl
                border
                bg-background
                p-5
                shadow-2xl
              "
            >
              <div
                className="
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  bg-red-50
                "
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <h3 className="mt-4 text-base font-semibold">
                Hapus Percakapan?
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Percakapan ini beserta seluruh pesan di dalamnya akan dihapus.
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={isDeleteSubmitting}
                  className="
                    rounded-xl
                    border
                    px-4 py-2.5
                    text-sm
                    font-medium
                    transition
                    hover:bg-muted
                    disabled:opacity-50
                  "
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleteSubmitting}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-4 py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isDeleteSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
