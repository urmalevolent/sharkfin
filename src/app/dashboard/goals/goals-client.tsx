"use client";

import {
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Edit3,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

type Goal = {
  id: string;
  name: string;

  targetAmount: string;
  currentAmount: string;
  remaining: string;

  progress: number;

  deadline: string | null;

  requiredMonthlySaving:
    | string
    | null;

  completed: boolean;

  wallet: {
    id: string;
    name: string;
    balance: string;
  } | null;

  createdAt: string;
  updatedAt: string;
};

type Wallet = {
  id: string;
  name: string;
  balance: string;
};

type Props = {
  initialGoals: Goal[];
  wallets: Wallet[];
};

type GoalVisualStatus =
  | "COMPLETED"
  | "NEARLY"
  | "PROGRESS";

function formatRupiah(
  value: string | number
) {
  const amount =
    typeof value === "string"
      ? Number(value)
      : value;

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "Tidak ada deadline";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(value));
}

function getProgressWidth(
  progress: number
) {
  return Math.min(
    Math.max(progress, 0),
    100
  );
}

function getGoalStatus(
  goal: Goal
): GoalVisualStatus {
  if (goal.completed || goal.progress >= 100) {
    return "COMPLETED";
  }

  if (goal.progress >= 75) {
    return "NEARLY";
  }

  return "PROGRESS";
}

function getStatusLabel(
  status: GoalVisualStatus
) {
  switch (status) {
    case "COMPLETED":
      return "Selesai";

    case "NEARLY":
      return "Mendekati Target";

    default:
      return "Berjalan";
  }
}

function getStatusClass(
  status: GoalVisualStatus
) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "NEARLY":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getProgressClass(
  status: GoalVisualStatus
) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500";

    case "NEARLY":
      return "bg-blue-600";

    default:
      return "bg-primary";
  }
}

export default function GoalsClient({
  initialGoals,
  wallets,
}: Props) {
  const [goals, setGoals] =
    useState<Goal[]>(
      initialGoals
    );

  const [showForm, setShowForm] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);

  const [goalToDelete, setGoalToDelete] =
    useState<Goal | null>(null);

  const [name, setName] =
    useState("");

  const [targetAmount, setTargetAmount] =
    useState("");

  const [deadline, setDeadline] =
    useState("");

  const [walletId, setWalletId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/goals",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal mengambil data goal."
        );
      }

      setGoals(
        data.goals ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setDeadline("");
    setWalletId("");

    setEditingGoal(null);
    setShowForm(false);
    setError("");
  };

  const openCreateForm = () => {
    setEditingGoal(null);
    setName("");
    setTargetAmount("");
    setDeadline("");
    setWalletId("");
    setError("");
    setShowForm(true);
  };

  const handleEdit = (
    goal: Goal
  ) => {
    setEditingGoal(goal);

    setName(goal.name);

    setTargetAmount(
      goal.targetAmount
    );

    setDeadline(
      goal.deadline
        ? goal.deadline.slice(
            0,
            10
          )
        : ""
    );

    setWalletId(
      goal.wallet?.id ?? ""
    );

    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!name.trim()) {
        setError(
          "Nama goal wajib diisi."
        );
        return;
      }

      if (
        !targetAmount ||
        Number(targetAmount) <= 0
      ) {
        setError(
          "Target goal harus lebih dari 0."
        );
        return;
      }

      const url = editingGoal
        ? `/api/goals/${editingGoal.id}`
        : "/api/goals";

      const method = editingGoal
        ? "PATCH"
        : "POST";

      const body = {
        name: name.trim(),
        targetAmount,
        deadline:
          deadline || null,
        walletId:
          walletId || null,
      };

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal menyimpan goal."
        );
      }

      resetForm();

      await loadGoals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (
    goal: Goal
  ) => {
    setGoalToDelete(goal);
    setError("");
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setGoalToDelete(null);
  };

  const handleDelete = async () => {
    if (!goalToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response =
        await fetch(
          `/api/goals/${goalToDelete.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal menghapus goal."
        );
      }

      setGoalToDelete(null);

      await loadGoals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setDeleting(false);
    }
  };

  const summary = useMemo(() => {
    const totalTarget =
      goals.reduce(
        (total, goal) =>
          total +
          Number(
            goal.targetAmount
          ),
        0
      );

    const totalCurrent =
      goals.reduce(
        (total, goal) =>
          total +
          Number(
            goal.currentAmount
          ),
        0
      );

    const completed =
      goals.filter(
        (goal) =>
          goal.completed
      ).length;

    const averageProgress =
      goals.length > 0
        ? goals.reduce(
            (total, goal) =>
              total +
              Math.min(
                Math.max(
                  goal.progress,
                  0
                ),
                100
              ),
            0
          ) / goals.length
        : 0;

    return {
      totalTarget,
      totalCurrent,
      completed,
      averageProgress,
    };
  }, [goals]);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-primary">
                Perencanaan Keuangan
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Financial Goals
              </h1>

              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                Tentukan target keuangan,
                hubungkan dengan wallet,
                dan pantau progresnya.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Tambah Goal
          </button>
        </section>

        {/* ========================================================= */}
        {/* ERROR */}
        {/* ========================================================= */}

        {error && !showForm && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

            <p>{error}</p>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUMMARY */}
        {/* ========================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Goal */}

          <div className="rounded-2xl border bg-background p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Goals
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Total Goal
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight">
              {goals.length}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {summary.completed} goal selesai
            </p>
          </div>

          {/* Total Target */}

          <div className="rounded-2xl border bg-background p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <CircleDollarSign className="h-5 w-5 text-blue-600" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Target
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Total Target
            </p>

            <p className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
              {formatRupiah(
                summary.totalTarget
              )}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Nilai seluruh target
            </p>
          </div>

          {/* Total Current */}

          <div className="rounded-2xl border bg-background p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Terkumpul
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Total Terkumpul
            </p>

            <p className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
              {formatRupiah(
                summary.totalCurrent
              )}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Dana yang sudah terkumpul
            </p>
          </div>

          {/* Average Progress */}

          <div className="rounded-2xl border bg-background p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Progress
              </span>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Rata-rata Progress
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight">
              {summary.averageProgress.toFixed(
                1
              )}
              %
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${getProgressWidth(
                    summary.averageProgress
                  )}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GOAL SECTION HEADER */}
        {/* ========================================================= */}

        <section className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Target Kamu
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Pantau perkembangan setiap
              target keuanganmu.
            </p>
          </div>

          {goals.length > 0 && (
            <button
              type="button"
              onClick={openCreateForm}
              className="hidden items-center gap-1 text-sm font-medium text-primary transition hover:opacity-80 sm:flex"
            >
              Goal baru
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </section>

        {/* ========================================================= */}
        {/* GOALS */}
        {/* ========================================================= */}

        {loading && goals.length === 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border bg-background p-6 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="h-11 w-11 rounded-xl bg-muted" />

                      <div>
                        <div className="h-4 w-32 rounded bg-muted" />

                        <div className="mt-2 h-3 w-24 rounded bg-muted" />
                      </div>
                    </div>

                    <div className="h-6 w-20 rounded-full bg-muted" />
                  </div>

                  <div className="mt-8 h-7 w-40 rounded bg-muted" />

                  <div className="mt-5 h-3 rounded-full bg-muted" />

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="h-12 rounded-xl bg-muted" />
                    <div className="h-12 rounded-xl bg-muted" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : goals.length === 0 ? (
          /* EMPTY STATE */

          <div className="rounded-2xl border bg-background px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
            </div>

            <h2 className="mt-5 text-lg font-bold">
              Belum ada financial goal
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Buat target keuangan pertamamu,
              misalnya laptop, dana darurat,
              kendaraan, atau liburan.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Buat Goal Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {goals.map(
              (goal) => {
                const progress =
                  getProgressWidth(
                    goal.progress
                  );

                const status =
                  getGoalStatus(
                    goal
                  );

                const remainingAmount =
                  Number(
                    goal.remaining
                  );

                return (
                  <article
                    key={goal.id}
                    className="group rounded-2xl border bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
                  >
                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Target className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold sm:text-lg">
                            {goal.name}
                          </h3>

                          {goal.wallet ? (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <WalletCards className="h-3.5 w-3.5" />

                              <span className="truncate">
                                {goal.wallet.name}
                              </span>
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Tidak terhubung ke wallet
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(
                          status
                        )}
                      </span>
                    </div>

                    {/* AMOUNT */}

                    <div className="mt-7 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Terkumpul
                        </p>

                        <p className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                          {formatRupiah(
                            goal.currentAmount
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">
                          Target
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatRupiah(
                            goal.targetAmount
                          )}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-6">
                      <div className="mb-2.5 flex items-center justify-between gap-4">
                        <span className="text-xs font-medium text-muted-foreground">
                          Progress
                        </span>

                        <span className="text-sm font-bold">
                          {goal.progress.toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getProgressClass(
                            status
                          )}`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/40 p-3.5">
                        <p className="text-[11px] text-muted-foreground">
                          Sisa Target
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold">
                          {remainingAmount > 0
                            ? formatRupiah(
                                goal.remaining
                              )
                            : "Target tercapai"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-muted/40 p-3.5">
                        <p className="text-[11px] text-muted-foreground">
                          Deadline
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold">
                          {goal.deadline
                            ? formatDate(
                                goal.deadline
                              )
                            : "Tanpa deadline"}
                        </p>
                      </div>
                    </div>

                    {/* MONTHLY SAVING */}

                    {goal.requiredMonthlySaving !==
                      null && (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
                            <TrendingUp className="h-4 w-4 text-primary" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Kebutuhan tabungan / bulan
                            </p>

                            <p className="mt-0.5 truncate text-sm font-bold">
                              {formatRupiah(
                                goal.requiredMonthlySaving
                              )}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    )}

                    {/* WALLET INFO */}

                    {goal.wallet && (
                      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-4">
                        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                          <WalletCards className="h-4 w-4 shrink-0" />

                          <span className="truncate">
                            Saldo wallet
                          </span>
                        </div>

                        <span className="shrink-0 text-sm font-semibold">
                          {formatRupiah(
                            goal.wallet.balance
                          )}
                        </span>
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-2 border-t pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            goal
                          )
                        }
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openDeleteModal(
                            goal
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-background px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Hapus
                        </span>
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM MODAL */}
        {/* ========================================================= */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="goal-modal-title"
            >
              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h2
                      id="goal-modal-title"
                      className="text-lg font-bold"
                    >
                      {editingGoal
                        ? "Edit Financial Goal"
                        : "Tambah Financial Goal"}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Atur target dan deadline
                      untuk membantu merencanakan
                      keuanganmu.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL BODY */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5 sm:p-6"
              >
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* NAME */}

                <div>
                  <label
                    htmlFor="goal-name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Nama Goal
                  </label>

                  <input
                    id="goal-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Contoh: Laptop"
                    disabled={loading}
                    className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Gunakan nama yang mudah
                    kamu kenali.
                  </p>
                </div>

                {/* TARGET */}

                <div>
                  <label
                    htmlFor="goal-target"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Target Dana
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      Rp
                    </span>

                    <input
                      id="goal-target"
                      type="number"
                      min="1"
                      value={targetAmount}
                      onChange={(event) =>
                        setTargetAmount(
                          event.target.value
                        )
                      }
                      placeholder="12000000"
                      disabled={loading}
                      className="h-11 w-full rounded-xl border bg-background pl-10 pr-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Masukkan angka tanpa titik
                    atau simbol Rp.
                  </p>
                </div>

                {/* WALLET */}

                <div>
                  <label
                    htmlFor="goal-wallet"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Wallet
                  </label>

                  <select
                    id="goal-wallet"
                    value={walletId}
                    onChange={(event) =>
                      setWalletId(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Tidak dikaitkan
                    </option>

                    {wallets.map(
                      (wallet) => (
                        <option
                          key={wallet.id}
                          value={wallet.id}
                        >
                          {wallet.name} —{" "}
                          {formatRupiah(
                            wallet.balance
                          )}
                        </option>
                      )
                    )}
                  </select>

                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    Jika dikaitkan, progress goal
                    akan mengikuti saldo wallet
                    tersebut.
                  </p>
                </div>

                {/* DEADLINE */}

                <div>
                  <label
                    htmlFor="goal-deadline"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Deadline
                  </label>

                  <input
                    id="goal-deadline"
                    type="date"
                    value={deadline}
                    onChange={(event) =>
                      setDeadline(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    Opsional. Deadline digunakan
                    untuk menghitung kebutuhan
                    tabungan per bulan.
                  </p>
                </div>

                {/* PREVIEW */}

                {targetAmount &&
                  Number(targetAmount) > 0 && (
                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                          <CircleDollarSign className="h-4 w-4 text-primary" />
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Target yang akan dibuat
                          </p>

                          <p className="mt-0.5 text-base font-bold">
                            {formatRupiah(
                              targetAmount
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ACTION */}

                <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="h-11 rounded-xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />

                        {editingGoal
                          ? "Simpan Perubahan"
                          : "Simpan Goal"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DELETE MODAL */}
        {/* ========================================================= */}

        {goalToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
              className="w-full max-w-md rounded-2xl border bg-background p-5 shadow-2xl sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-goal-title"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>

                <div className="min-w-0">
                  <h2
                    id="delete-goal-title"
                    className="text-lg font-bold"
                  >
                    Hapus Financial Goal?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Tindakan ini akan menghapus
                    goal dari daftar perencanaanmu.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  Goal yang akan dihapus
                </p>

                <p className="mt-1 truncate font-semibold">
                  {goalToDelete.name}
                </p>

                <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Target
                  </span>

                  <span className="font-semibold">
                    {formatRupiah(
                      goalToDelete.targetAmount
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-800">
                Menghapus goal tidak menghapus
                saldo wallet atau transaksi
                yang sudah ada.
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={deleting}
                  className="h-11 rounded-xl border px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Hapus Goal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}