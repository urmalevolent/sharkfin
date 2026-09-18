"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  Plus,
  RefreshCw,
  Repeat2,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

type Recurrence =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

type ScheduledExpense = {
  id: string;
  name: string;
  amount: string;
  nextDate: string;
  recurrence: Recurrence;
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
  isActive: boolean;
  wallet: {
    id: string;
    name: string;
    balance: string;
  };
  createdAt: string;
  updatedAt: string;
};

type Wallet = {
  id: string;
  name: string;
  balance: string;
};

type Props = {
  initialExpenses: ScheduledExpense[];
  wallets: Wallet[];
};

type ModalType =
  | "FORM"
  | "DELETE"
  | "TOGGLE"
  | null;

function formatRupiah(
  value: string | number,
) {
  const amount =
    typeof value === "string"
      ? Number(value)
      : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatRecurrence(
  value: Recurrence,
) {
  switch (value) {
    case "DAILY":
      return "Setiap hari";

    case "WEEKLY":
      return "Setiap minggu";

    case "MONTHLY":
      return "Setiap bulan";

    case "YEARLY":
      return "Setiap tahun";

    default:
      return value;
  }
}

function getRecurrenceDescription(
  value: Recurrence,
) {
  switch (value) {
    case "DAILY":
      return "Pengeluaran berulang setiap hari.";

    case "WEEKLY":
      return "Pengeluaran berulang setiap minggu.";

    case "MONTHLY":
      return "Pengeluaran berulang setiap bulan.";

    case "YEARLY":
      return "Pengeluaran berulang setiap tahun.";

    default:
      return "";
  }
}

function isUpcoming(
  nextDate: string,
) {
  const now = new Date();
  const date = new Date(nextDate);

  const diff =
    date.getTime() - now.getTime();

  const days =
    diff / (1000 * 60 * 60 * 24);

  return days >= 0 && days <= 7;
}

function getDaysUntil(
  nextDate: string,
) {
  const now = new Date();
  const date = new Date(nextDate);

  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diff =
    date.getTime() - now.getTime();

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24),
  );
}

export default function ScheduledExpensesClient({
  initialExpenses,
  wallets,
}: Props) {
  const [expenses, setExpenses] =
    useState<ScheduledExpense[]>(
      initialExpenses,
    );

  const [modal, setModal] =
    useState<ModalType>(null);

  const [editingExpense, setEditingExpense] =
    useState<ScheduledExpense | null>(null);

  const [selectedExpense, setSelectedExpense] =
    useState<ScheduledExpense | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [nextDate, setNextDate] =
    useState("");
  const [recurrence, setRecurrence] =
    useState<Recurrence>("MONTHLY");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const activeExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) =>
          expense.isActive,
      ),
    [expenses],
  );

  const upcomingTotal = useMemo(
    () =>
      activeExpenses.reduce(
        (total, expense) =>
          total +
          Number(expense.amount),
        0,
      ),
    [activeExpenses],
  );

  const involvedWallets = useMemo(
    () =>
      new Set(
        activeExpenses.map(
          (expense) =>
            expense.wallet.id,
        ),
      ).size,
    [activeExpenses],
  );

  const nearestExpense = useMemo(() => {
    const upcoming =
      activeExpenses
        .filter(
          (expense) =>
            new Date(
              expense.nextDate,
            ).getTime() >=
            Date.now(),
        )
        .sort(
          (a, b) =>
            new Date(
              a.nextDate,
            ).getTime() -
            new Date(
              b.nextDate,
            ).getTime(),
        );

    return upcoming[0] ?? null;
  }, [activeExpenses]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/scheduled-expenses",
        {
          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal mengambil scheduled expenses.",
        );
      }

      setExpenses(
        data.scheduledExpenses ?? [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setWalletId("");
    setNextDate("");
    setRecurrence("MONTHLY");
    setEditingExpense(null);
    setModal(null);
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setName("");
    setAmount("");
    setWalletId("");
    setNextDate("");
    setRecurrence("MONTHLY");
    setError("");
    setModal("FORM");
  };

  const handleEdit = (
    expense: ScheduledExpense,
  ) => {
    setEditingExpense(expense);
    setName(expense.name);
    setAmount(expense.amount);
    setWalletId(
      expense.wallet.id,
    );
    setNextDate(
      expense.nextDate.slice(0, 10),
    );
    setRecurrence(
      expense.recurrence,
    );
    setError("");
    setModal("FORM");
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!name.trim()) {
        setError(
          "Nama pengeluaran wajib diisi.",
        );
        return;
      }

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        setError(
          "Nominal harus lebih dari 0.",
        );
        return;
      }

      if (!walletId) {
        setError(
          "Wallet wajib dipilih.",
        );
        return;
      }

      if (!nextDate) {
        setError(
          "Tanggal pengeluaran wajib diisi.",
        );
        return;
      }

      const url = editingExpense
        ? `/api/scheduled-expenses/${editingExpense.id}`
        : "/api/scheduled-expenses";

      const method = editingExpense
        ? "PATCH"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            amount,
            walletId,
            nextDate,
            recurrence,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal menyimpan scheduled expense.",
        );
      }

      resetForm();
      await loadExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    expense: ScheduledExpense,
  ) => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/scheduled-expenses/${expense.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isActive:
              !expense.isActive,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal mengubah status.",
        );
      }

      setModal(null);
      setSelectedExpense(null);

      await loadExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    expense: ScheduledExpense,
  ) => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/scheduled-expenses/${expense.id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal menghapus scheduled expense.",
        );
      }

      setModal(null);
      setSelectedExpense(null);

      await loadExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        {/* =================================
            HEADER
        ================================== */}

        <section className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="absolute right-0 top-0 h-44 w-44 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <CalendarClock className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    Scheduled Expenses
                  </h1>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                    Atur pengeluaran rutin dan
                    pembayaran yang akan datang
                    agar cashflow lebih mudah
                    dipantau.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Tambah Pengeluaran
              </button>
            </div>
          </div>
        </section>

        {/* =================================
            ERROR
        ================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-medium">
                Terjadi kesalahan
              </p>

              <p className="mt-1 leading-5">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 transition hover:bg-red-500/10"
              aria-label="Tutup pesan error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =================================
            SUMMARY
        ================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Pengeluaran Aktif"
            value={activeExpenses.length.toString()}
            description="Jadwal yang sedang aktif"
            icon={CalendarClock}
            iconClass="bg-primary/10 text-primary"
          />

          <SummaryCard
            label="Total Nominal"
            value={formatRupiah(
              upcomingTotal,
            )}
            description="Dari seluruh jadwal aktif"
            icon={RefreshCw}
            iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />

          <SummaryCard
            label="Wallet Terlibat"
            value={involvedWallets.toString()}
            description="Wallet yang digunakan"
            icon={WalletCards}
            iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />

          <SummaryCard
            label="Terdekat"
            value={
              nearestExpense
                ? formatShortDate(
                    nearestExpense.nextDate,
                  )
                : "-"
            }
            description={
              nearestExpense
                ? nearestExpense.name
                : "Belum ada jadwal"
            }
            icon={Clock3}
            iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
        </section>

        {/* =================================
            UPCOMING HIGHLIGHT
        ================================== */}

        {nearestExpense && (
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Pengeluaran Berikutnya
                  </p>

                  <h2 className="mt-1 font-semibold">
                    {nearestExpense.name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(
                      nearestExpense.nextDate,
                    )}{" "}
                    ·{" "}
                    {formatRupiah(
                      nearestExpense.amount,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs font-medium">
                {getDaysUntil(
                  nearestExpense.nextDate,
                ) === 0
                  ? "Hari ini"
                  : getDaysUntil(
                        nearestExpense.nextDate,
                      ) === 1
                    ? "Besok"
                    : `${getDaysUntil(
                        nearestExpense.nextDate,
                      )} hari lagi`}
              </div>
            </div>
          </section>
        )}

        {/* =================================
            SECTION HEADER
        ================================== */}

        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-semibold">
              Daftar Pengeluaran
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Kelola semua jadwal pengeluaran
              kamu.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {expenses.length} jadwal
          </span>
        </div>

        {/* =================================
            LOADING
        ================================== */}

        {loading ? (
          <LoadingState />
        ) : expenses.length === 0 ? (
          <EmptyState
            onAdd={openCreateModal}
          />
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {expenses.map(
              (expense) => (
                <ScheduledExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEdit}
                  onToggle={(item) => {
                    setSelectedExpense(
                      item,
                    );
                    setModal("TOGGLE");
                  }}
                  onDelete={(item) => {
                    setSelectedExpense(
                      item,
                    );
                    setModal("DELETE");
                  }}
                />
              ),
            )}
          </section>
        )}

        {/* =================================
            FORM MODAL
        ================================== */}

        {modal === "FORM" && (
          <ModalOverlay
            onClose={() => {
              if (!saving) {
                resetForm();
              }
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border bg-card shadow-2xl">
              <div className="flex items-start justify-between border-b p-5 sm:p-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {editingExpense ? (
                        <Edit3 className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        {editingExpense
                          ? "Edit Scheduled Expense"
                          : "Tambah Scheduled Expense"}
                      </h2>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Atur detail pengeluaran
                        rutin kamu.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={resetForm}
                  className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Tutup modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5 sm:p-6"
              >
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Nama Pengeluaran"
                    description="Gunakan nama yang mudah dikenali."
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Contoh: Internet"
                      className="input-sharkfin"
                      disabled={saving}
                    />
                  </FormField>

                  <FormField
                    label="Nominal"
                    description="Masukkan angka tanpa titik atau Rp."
                  >
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(event) =>
                          setAmount(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Contoh: 300000"
                        className="input-sharkfin pr-16"
                        disabled={saving}
                      />

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        IDR
                      </span>
                    </div>
                  </FormField>

                  <FormField
                    label="Wallet"
                    description="Wallet yang akan digunakan untuk pengeluaran."
                  >
                    <select
                      value={walletId}
                      onChange={(event) =>
                        setWalletId(
                          event.target
                            .value,
                        )
                      }
                      className="input-sharkfin"
                      disabled={saving}
                    >
                      <option value="">
                        Pilih wallet
                      </option>

                      {wallets.map(
                        (wallet) => (
                          <option
                            key={
                              wallet.id
                            }
                            value={
                              wallet.id
                            }
                          >
                            {wallet.name} —{" "}
                            {formatRupiah(
                              wallet.balance,
                            )}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Pengeluaran Berikutnya"
                    description="Tanggal pembayaran berikutnya."
                  >
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(event) =>
                        setNextDate(
                          event.target
                            .value,
                        )
                      }
                      className="input-sharkfin"
                      disabled={saving}
                    />
                  </FormField>

                  <FormField
                    label="Pengulangan"
                    description={getRecurrenceDescription(
                      recurrence,
                    )}
                  >
                    <select
                      value={recurrence}
                      onChange={(event) =>
                        setRecurrence(
                          event.target
                            .value as Recurrence,
                        )
                      }
                      className="input-sharkfin"
                      disabled={saving}
                    >
                      <option value="DAILY">
                        Setiap hari
                      </option>

                      <option value="WEEKLY">
                        Setiap minggu
                      </option>

                      <option value="MONTHLY">
                        Setiap bulan
                      </option>

                      <option value="YEARLY">
                        Setiap tahun
                      </option>
                    </select>
                  </FormField>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Repeat2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                    <p className="text-xs leading-5 text-muted-foreground">
                      Scheduled Expense digunakan
                      untuk mencatat kewajiban
                      yang akan datang. Saat ini
                      jadwal belum otomatis
                      membuat transaksi pengeluaran.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={resetForm}
                    className="h-10 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}

                    {editingExpense
                      ? "Simpan Perubahan"
                      : "Simpan Pengeluaran"}
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        )}

        {/* =================================
            DELETE MODAL
        ================================== */}

        {modal === "DELETE" &&
          selectedExpense && (
            <ModalOverlay
              onClose={() => {
                if (!saving) {
                  setModal(null);
                  setSelectedExpense(
                    null,
                  );
                }
              }}
            >
              <ConfirmationModal
                icon={Trash2}
                title="Hapus Scheduled Expense?"
                description={
                  <>
                    Kamu akan menghapus{" "}
                    <strong className="text-foreground">
                      {selectedExpense.name}
                    </strong>
                    . Tindakan ini tidak dapat
                    dibatalkan.
                  </>
                }
                confirmLabel="Ya, Hapus"
                loading={saving}
                danger
                onCancel={() => {
                  setModal(null);
                  setSelectedExpense(
                    null,
                  );
                }}
                onConfirm={() =>
                  handleDelete(
                    selectedExpense,
                  )
                }
              />
            </ModalOverlay>
          )}

        {/* =================================
            TOGGLE MODAL
        ================================== */}

        {modal === "TOGGLE" &&
          selectedExpense && (
            <ModalOverlay
              onClose={() => {
                if (!saving) {
                  setModal(null);
                  setSelectedExpense(
                    null,
                  );
                }
              }}
            >
              <ConfirmationModal
                icon={
                  selectedExpense.isActive
                    ? Clock3
                    : Check
                }
                title={
                  selectedExpense.isActive
                    ? "Nonaktifkan Jadwal?"
                    : "Aktifkan Jadwal?"
                }
                description={
                  selectedExpense.isActive
                    ? `Jadwal "${selectedExpense.name}" tidak akan dianggap sebagai kewajiban aktif sampai kamu mengaktifkannya kembali.`
                    : `Jadwal "${selectedExpense.name}" akan kembali menjadi pengeluaran aktif.`
                }
                confirmLabel={
                  selectedExpense.isActive
                    ? "Nonaktifkan"
                    : "Aktifkan"
                }
                loading={saving}
                onCancel={() => {
                  setModal(null);
                  setSelectedExpense(
                    null,
                  );
                }}
                onConfirm={() =>
                  handleToggle(
                    selectedExpense,
                  )
                }
              />
            </ModalOverlay>
          )}
      </div>
    </div>
  );
}

/* =================================
   SUMMARY CARD
================================= */

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* =================================
   SCHEDULED EXPENSE CARD
================================= */

function ScheduledExpenseCard({
  expense,
  onEdit,
  onToggle,
  onDelete,
}: {
  expense: ScheduledExpense;
  onEdit: (
    expense: ScheduledExpense,
  ) => void;
  onToggle: (
    expense: ScheduledExpense,
  ) => void;
  onDelete: (
    expense: ScheduledExpense,
  ) => void;
}) {
  const upcoming = isUpcoming(
    expense.nextDate,
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
        expense.isActive
          ? ""
          : "opacity-75"
      }`}
    >
      {expense.isActive && (
        <div className="absolute left-0 top-0 h-full w-1 bg-primary" />
      )}

      <div className="pl-1">
        {/* CARD HEADER */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                expense.isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <CalendarClock className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-semibold">
                  {expense.name}
                </h3>

                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    expense.isActive
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {expense.isActive
                    ? "Aktif"
                    : "Nonaktif"}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <WalletCards className="h-3.5 w-3.5" />

                <span className="truncate">
                  {expense.wallet.name}
                </span>
              </div>
            </div>
          </div>

          <span className="shrink-0 rounded-lg bg-muted/60 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            {formatRecurrence(
              expense.recurrence,
            )}
          </span>
        </div>

        {/* AMOUNT */}

        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground">
            Nominal
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight">
            {formatRupiah(
              expense.amount,
            )}
          </p>
        </div>

        {/* DETAILS */}

        <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />

              <span>
                Pengeluaran berikutnya
              </span>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {formatDate(
                expense.nextDate,
              )}
            </p>

            {upcoming &&
              expense.isActive && (
                <p className="mt-1 text-xs font-medium text-primary">
                  Segera jatuh tempo
                </p>
              )}
          </div>

          <div className="rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <WalletCards className="h-3.5 w-3.5" />

              <span>
                Saldo wallet
              </span>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {formatRupiah(
                expense.wallet
                  .balance,
              )}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
          <button
            type="button"
            onClick={() =>
              onEdit(expense)
            }
            className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition hover:bg-muted"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onToggle(expense)
            }
            className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition hover:bg-muted"
          >
            {expense.isActive ? (
              <>
                <Clock3 className="h-3.5 w-3.5" />
                Nonaktifkan
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Aktifkan
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(expense)
            }
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/20 px-3 text-xs font-medium text-red-600 transition hover:bg-red-500/5 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>

          <ChevronRight className="hidden h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 sm:block" />
        </div>
      </div>
    </article>
  );
}

/* =================================
   FORM FIELD
================================= */

function FormField({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

      {children}

      <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* =================================
   MODAL OVERLAY
================================= */

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* =================================
   CONFIRMATION MODAL
================================= */

function ConfirmationModal({
  icon: Icon,
  title,
  description,
  confirmLabel,
  loading,
  danger = false,
  onCancel,
  onConfirm,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  loading: boolean;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className="h-10 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            danger
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:opacity-90"
          }`}
        >
          {loading && (
            <RefreshCw className="h-4 w-4 animate-spin" />
          )}

          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

/* =================================
   EMPTY STATE
================================= */

function EmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <section className="rounded-3xl border border-dashed bg-card p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarClock className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-base font-semibold">
        Belum ada pengeluaran terjadwal
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Tambahkan pengeluaran rutin seperti
        internet, kost, cicilan, atau
        langganan agar kewajiban yang akan
        datang lebih mudah dipantau.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Tambah Pengeluaran
      </button>
    </section>
  );
}

/* =================================
   LOADING STATE
================================= */

function LoadingState() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border bg-card p-6"
        >
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-muted" />

              <div className="h-3 w-28 rounded bg-muted" />
            </div>

            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>

          <div className="mt-6 h-7 w-36 rounded bg-muted" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-xl bg-muted" />

            <div className="h-20 rounded-xl bg-muted" />
          </div>

          <div className="mt-5 h-10 rounded-xl bg-muted" />
        </div>
      ))}
    </section>
  );
}