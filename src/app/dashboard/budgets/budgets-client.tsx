"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  Target,
  Trash2,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

type BudgetStatus =
  | "NORMAL"
  | "WATCH"
  | "WARNING"
  | "EXCEEDED";

type Budget = {
  id: string;

  category: {
    id: string;
    name: string;
    icon: string | null;
  };

  month: number;
  year: number;

  amount: string;
  spent: string;
  remaining: string;

  usage: number;
  status: BudgetStatus;

  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  icon: string | null;
};

type Props = {
  initialBudgets: Budget[];
  categories: Category[];
  initialMonth: number;
  initialYear: number;
};

function formatRupiah(value: string | number) {
  const amount =
    typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMonthName(month: number) {
  return new Date(2000, month - 1).toLocaleString("id-ID", {
    month: "long",
  });
}

function getStatusLabel(status: BudgetStatus) {
  switch (status) {
    case "NORMAL":
      return "Normal";

    case "WATCH":
      return "Perhatikan";

    case "WARNING":
      return "Peringatan";

    case "EXCEEDED":
      return "Melebihi Budget";

    default:
      return status;
  }
}

function getStatusIcon(status: BudgetStatus) {
  switch (status) {
    case "NORMAL":
      return CheckCircle2;

    case "WATCH":
      return MoreHorizontal;

    case "WARNING":
      return AlertTriangle;

    case "EXCEEDED":
      return XCircle;

    default:
      return MoreHorizontal;
  }
}

function getStatusClass(status: BudgetStatus) {
  switch (status) {
    case "NORMAL":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case "WATCH":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";

    case "WARNING":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400";

    case "EXCEEDED":
      return "bg-red-500/10 text-red-600 dark:text-red-400";

    default:
      return "bg-muted text-muted-foreground";
  }
}

function getProgressClass(status: BudgetStatus) {
  switch (status) {
    case "NORMAL":
      return "bg-emerald-500";

    case "WATCH":
      return "bg-amber-500";

    case "WARNING":
      return "bg-orange-500";

    case "EXCEEDED":
      return "bg-red-500";

    default:
      return "bg-primary";
  }
}

function getCategoryIcon(category: Category | Budget["category"]) {
  return category.icon || "💰";
}

function getProgressWidth(usage: number) {
  return Math.min(Math.max(usage, 0), 100);
}

export default function BudgetsClient({
  initialBudgets,
  categories,
  initialMonth,
  initialYear,
}: Props) {
  const [budgets, setBudgets] =
    useState<Budget[]>(initialBudgets);

  const [selectedMonth, setSelectedMonth] =
    useState(initialMonth);

  const [selectedYear, setSelectedYear] =
    useState(initialYear);

  const [loading, setLoading] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingBudget, setEditingBudget] =
    useState<Budget | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [error, setError] =
    useState("");

  // ========================================================
  // LOAD BUDGETS
  // ========================================================

  const loadBudgets = async (
    month: number,
    year: number
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/budgets?month=${month}&year=${year}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Gagal mengambil data budget."
        );
      }

      setBudgets(data.data ?? []);
    } catch (err) {
      console.error("Load budgets error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // PERIOD CHANGE
  // ========================================================

  const handlePeriodChange = async (
    month: number,
    year: number
  ) => {
    setSelectedMonth(month);
    setSelectedYear(year);

    await loadBudgets(month, year);
  };

  const goToPreviousMonth = async () => {
    let month = selectedMonth - 1;
    let year = selectedYear;

    if (month < 1) {
      month = 12;
      year -= 1;
    }

    await handlePeriodChange(month, year);
  };

  const goToNextMonth = async () => {
    let month = selectedMonth + 1;
    let year = selectedYear;

    if (month > 12) {
      month = 1;
      year += 1;
    }

    await handlePeriodChange(month, year);
  };

  // ========================================================
  // RESET FORM
  // ========================================================

  const resetForm = () => {
    setSelectedCategoryId("");
    setAmount("");
    setEditingBudget(null);
    setShowForm(false);
    setError("");
  };

  // ========================================================
  // OPEN ADD
  // ========================================================

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setSelectedCategoryId("");
    setAmount("");
    setError("");
    setShowForm(true);
  };

  // ========================================================
  // SUBMIT
  // ========================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setError("");

      if (!selectedCategoryId) {
        setError("Silakan pilih kategori.");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        setError(
          "Jumlah budget harus lebih dari 0."
        );
        return;
      }

      const url = editingBudget
        ? `/api/budgets/${editingBudget.id}`
        : "/api/budgets";

      const method = editingBudget
        ? "PATCH"
        : "POST";

      const body = {
        categoryId: selectedCategoryId,
        month: selectedMonth,
        year: selectedYear,
        amount,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Gagal menyimpan budget."
        );
      }

      resetForm();

      await loadBudgets(
        selectedMonth,
        selectedYear
      );
    } catch (err) {
      console.error(
        "Submit budget error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    }
  };

  // ========================================================
  // DELETE
  // ========================================================

  const handleDelete = async (
    budgetId: string
  ) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus budget ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/budgets/${budgetId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Gagal menghapus budget."
        );
      }

      await loadBudgets(
        selectedMonth,
        selectedYear
      );
    } catch (err) {
      console.error(
        "Delete budget error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    }
  };

  // ========================================================
  // EDIT
  // ========================================================

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);

    setSelectedCategoryId(
      budget.category.id
    );

    setAmount(budget.amount);

    setShowForm(true);
    setError("");
  };

  // ========================================================
  // AVAILABLE CATEGORIES
  // ========================================================

  const availableCategories = useMemo(() => {
    if (editingBudget) {
      return categories;
    }

    const usedCategoryIds =
      new Set(
        budgets.map(
          (budget) =>
            budget.category.id
        )
      );

    return categories.filter(
      (category) =>
        !usedCategoryIds.has(
          category.id
        )
    );
  }, [
    categories,
    budgets,
    editingBudget,
  ]);

  // ========================================================
  // SUMMARY
  // ========================================================

  const summary = useMemo(() => {
    const totalBudget = budgets.reduce(
      (total, budget) =>
        total + Number(budget.amount),
      0
    );

    const totalSpent = budgets.reduce(
      (total, budget) =>
        total + Number(budget.spent),
      0
    );

    const totalRemaining =
      budgets.reduce(
        (total, budget) =>
          total + Number(budget.remaining),
        0
      );

    const exceededCount =
      budgets.filter(
        (budget) =>
          budget.status === "EXCEEDED"
      ).length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      exceededCount,
    };
  }, [budgets]);

  // ========================================================
  // UI
  // ========================================================

  return (
    <>
      <div className="min-h-screen bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Keuangan</span>
                <span>/</span>
                <span className="text-foreground">
                  Budget
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Budget
              </h1>

              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                Atur batas pengeluaran agar keuanganmu
                tetap terkontrol.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Buat Budget
            </button>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL BUDGET */}

            <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <WalletCards className="h-5 w-5" />
                </div>

                <span className="text-xs text-muted-foreground">
                  Batas
                </span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Total Budget
              </p>

              <p className="mt-1 break-all text-xl font-bold tracking-tight">
                {formatRupiah(summary.totalBudget)}
              </p>
            </div>

            {/* SPENT */}

            <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Receipt className="h-5 w-5" />
                </div>

                <span className="text-xs text-muted-foreground">
                  Terpakai
                </span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Total Terpakai
              </p>

              <p className="mt-1 break-all text-xl font-bold tracking-tight">
                {formatRupiah(summary.totalSpent)}
              </p>
            </div>

            {/* REMAINING */}

            <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CircleDollarSign className="h-5 w-5" />
                </div>

                <span className="text-xs text-muted-foreground">
                  Tersisa
                </span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Total Tersisa
              </p>

              <p
                className={`mt-1 break-all text-xl font-bold tracking-tight ${
                  summary.totalRemaining < 0
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }`}
              >
                {formatRupiah(summary.totalRemaining)}
              </p>
            </div>

            {/* BUDGET COUNT */}

            <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Target className="h-5 w-5" />
                </div>

                {summary.exceededCount > 0 && (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    {summary.exceededCount} terlewati
                  </span>
                )}
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Jumlah Budget
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight">
                {budgets.length}
              </p>
            </div>
          </section>

          {/* =================================================
              PERIOD SELECTOR
          ================================================= */}

          <section className="mb-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Periode Budget
                </p>

                <h2 className="mt-1 text-lg font-bold capitalize">
                  {getMonthName(selectedMonth)}{" "}
                  {selectedYear}
                </h2>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  disabled={loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  title="Bulan sebelumnya"
                  aria-label="Bulan sebelumnya"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    handlePeriodChange(
                      Number(event.target.value),
                      selectedYear
                    )
                  }
                  disabled={loading}
                  className="h-10 rounded-xl border bg-background px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {Array.from(
                    { length: 12 },
                    (_, index) => {
                      const month = index + 1;

                      return (
                        <option
                          key={month}
                          value={month}
                        >
                          {getMonthName(month)}
                        </option>
                      );
                    }
                  )}
                </select>

                <select
                  value={selectedYear}
                  onChange={(event) =>
                    handlePeriodChange(
                      selectedMonth,
                      Number(event.target.value)
                    )
                  }
                  disabled={loading}
                  className="h-10 rounded-xl border bg-background px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {Array.from(
                    { length: 5 },
                    (_, index) => {
                      const year =
                        initialYear - 2 + index;

                      return (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      );
                    }
                  )}
                </select>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  disabled={loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  title="Bulan berikutnya"
                  aria-label="Bulan berikutnya"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto shrink-0 rounded-lg p-1 transition hover:bg-red-100 dark:hover:bg-red-950"
                aria-label="Tutup pesan error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          {showForm && (
            <section className="mb-8 rounded-3xl border bg-card p-6 shadow-sm sm:p-7">

              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {editingBudget ? (
                      <Pencil className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </div>

                  <h2 className="text-xl font-bold">
                    {editingBudget
                      ? "Edit Budget"
                      : "Buat Budget"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {editingBudget
                      ? "Perbarui batas pengeluaran kategori ini."
                      : `Atur batas pengeluaran untuk ${getMonthName(
                          selectedMonth
                        )} ${selectedYear}.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Tutup form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-5 md:grid-cols-2"
              >

                {/* CATEGORY */}

                <div>
                  <label
                    htmlFor="budget-category"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Kategori
                  </label>

                  <select
                    id="budget-category"
                    value={selectedCategoryId}
                    onChange={(event) =>
                      setSelectedCategoryId(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">
                      Pilih kategori
                    </option>

                    {availableCategories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.icon
                            ? `${category.icon} `
                            : ""}
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Pilih kategori pengeluaran yang ingin
                    kamu batasi.
                  </p>
                </div>

                {/* AMOUNT */}

                <div>
                  <label
                    htmlFor="budget-amount"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Jumlah Budget
                  </label>

                  <input
                    id="budget-amount"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value
                      )
                    }
                    placeholder="Contoh: 500000"
                    className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Masukkan angka tanpa titik atau simbol
                    Rp.
                  </p>
                </div>

                {/* FORM ERROR */}

                {error && (
                  <div className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* BUTTONS */}

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row md:col-span-2 md:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="h-11 rounded-xl border px-5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Menyimpan..."
                      : editingBudget
                        ? "Simpan Perubahan"
                        : "Simpan Budget"}
                  </button>
                </div>

              </form>
            </section>
          )}

          {/* =================================================
              BUDGET LIST HEADER
          ================================================= */}

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Budget Kamu
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Pantau penggunaan budget{" "}
                <span className="capitalize">
                  {getMonthName(selectedMonth)}
                </span>{" "}
                {selectedYear}.
              </p>
            </div>

            {budgets.length > 0 && (
              <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
                {budgets.length} kategori
              </span>
            )}
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">

              {Array.from(
                { length: 4 },
                (_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border bg-card p-5 shadow-sm"
                  >
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-muted" />

                          <div>
                            <div className="h-4 w-28 rounded bg-muted" />
                            <div className="mt-2 h-3 w-16 rounded bg-muted" />
                          </div>
                        </div>

                        <div className="h-6 w-20 rounded-full bg-muted" />
                      </div>

                      <div className="mt-8 h-7 w-36 rounded bg-muted" />

                      <div className="mt-5 h-2 rounded-full bg-muted" />

                      <div className="mt-4 h-4 w-full rounded bg-muted" />

                      <div className="mt-6 h-9 rounded-xl bg-muted" />
                    </div>
                  </div>
                )
              )}

            </div>
          ) : budgets.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="rounded-3xl border border-dashed bg-card p-8 text-center shadow-sm sm:p-12">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-bold">
                Belum ada budget
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Belum ada batas pengeluaran untuk periode
                ini. Buat budget agar kamu bisa memantau
                pengeluaran berdasarkan kategori.
              </p>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Buat Budget
              </button>

            </div>

          ) : (

            /* =================================================
               BUDGET CARDS
            ================================================= */

            <div className="grid gap-4 md:grid-cols-2">

              {budgets.map((budget) => {
                const progress =
                  getProgressWidth(
                    budget.usage
                  );

                const StatusIcon =
                  getStatusIcon(
                    budget.status
                  );

                return (
                  <article
                    key={budget.id}
                    className="group rounded-3xl border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
                  >

                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl">
                          {getCategoryIcon(
                            budget.category
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {budget.category.name}
                          </h3>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Batas{" "}
                            {formatRupiah(
                              budget.amount
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          budget.status
                        )}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {getStatusLabel(
                          budget.status
                        )}
                      </div>

                    </div>

                    {/* AMOUNT */}

                    <div className="mt-7">
                      <div className="flex items-end justify-between gap-4">

                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Terpakai
                          </p>

                          <p className="mt-1 break-all text-2xl font-bold tracking-tight">
                            {formatRupiah(
                              budget.spent
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 text-lg font-bold">
                          {budget.usage.toFixed(0)}%
                        </p>

                      </div>

                      {/* PROGRESS */}

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressClass(
                            budget.status
                          )}`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
                        <span>
                          Rp 0
                        </span>

                        <span>
                          {formatRupiah(
                            budget.amount
                          )}
                        </span>
                      </div>
                    </div>

                    {/* REMAINING */}

                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        Sisa budget
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          Number(
                            budget.remaining
                          ) < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        {formatRupiah(
                          budget.remaining
                        )}
                      </span>
                    </div>

                    {/* EXCEEDED / WARNING MESSAGE */}

                    {budget.status ===
                      "EXCEEDED" && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-600 dark:text-red-400">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>
                          Pengeluaran sudah melewati batas
                          budget kategori ini.
                        </span>
                      </div>
                    )}

                    {budget.status ===
                      "WARNING" && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-orange-500/5 px-4 py-3 text-xs leading-5 text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>
                          Penggunaan budget sudah mendekati
                          batas yang ditentukan.
                        </span>
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-2 border-t pt-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            budget
                          )
                        }
                        className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border bg-background px-3 text-sm font-medium transition hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            budget.id
                          )
                        }
                        className="inline-flex h-9 items-center justify-center rounded-xl border px-3 text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        title="Hapus budget"
                        aria-label={`Hapus budget ${budget.category.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

          {/* =================================================
              INFORMATION
          ================================================= */}

          {budgets.length > 0 && !loading && (
            <div className="mt-8 rounded-2xl border bg-card p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CircleDollarSign className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Tentang Budget
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Budget adalah batas pengeluaran yang
                    kamu tentukan untuk suatu kategori.
                    Pengeluaran aktual tetap tercatat
                    melalui transaksi dan akan digunakan
                    SharkFin untuk menghitung penggunaan
                    budget.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}