"use client";

import { useMemo, useState } from "react";

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
    typeof value === "string"
      ? Number(value)
      : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
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

function getStatusClass(status: BudgetStatus) {
  switch (status) {
    case "NORMAL":
      return "bg-green-100 text-green-700";

    case "WATCH":
      return "bg-yellow-100 text-yellow-700";

    case "WARNING":
      return "bg-orange-100 text-orange-700";

    case "EXCEEDED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
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
          data.error ||
            "Gagal mengambil data budget."
        );
      }

      setBudgets(data.budgets ?? []);
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

  const handlePeriodChange = async (
    month: number,
    year: number
  ) => {
    setSelectedMonth(month);
    setSelectedYear(year);

    await loadBudgets(month, year);
  };

  const resetForm = () => {
    setSelectedCategoryId("");
    setAmount("");
    setEditingBudget(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setError("");

      if (!selectedCategoryId) {
        setError(
          "Silakan pilih kategori."
        );
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
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
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
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    }
  };

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
          data.error ||
            "Gagal menghapus budget."
        );
      }

      await loadBudgets(
        selectedMonth,
        selectedYear
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);

    setSelectedCategoryId(
      budget.category.id
    );

    setAmount(budget.amount);

    setShowForm(true);
    setError("");
  };

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

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
    };
  }, [budgets]);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Budget
            </h1>

            <p className="text-sm text-gray-500">
              Atur batas pengeluaran
              bulananmu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBudget(null);
              setSelectedCategoryId("");
              setAmount("");
              setShowForm(true);
              setError("");
            }}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Tambah Budget
          </button>
        </div>

        {/* PERIOD */}

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedMonth}
            onChange={(event) =>
              handlePeriodChange(
                Number(event.target.value),
                selectedYear
              )
            }
            className="rounded-lg border px-3 py-2 text-sm"
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
                    {new Date(
                      2000,
                      index
                    ).toLocaleString(
                      "id-ID",
                      {
                        month: "long",
                      }
                    )}
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
            className="rounded-lg border px-3 py-2 text-sm"
          >
            {Array.from(
              { length: 5 },
              (_, index) => {
                const year =
                  initialYear -
                  2 +
                  index;

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
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Budget
            </p>

            <p className="mt-2 text-xl font-bold">
              {formatRupiah(
                summary.totalBudget
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Terpakai
            </p>

            <p className="mt-2 text-xl font-bold">
              {formatRupiah(
                summary.totalSpent
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Sisa Budget
            </p>

            <p className="mt-2 text-xl font-bold">
              {formatRupiah(
                summary.totalRemaining
              )}
            </p>
          </div>

        </div>

        {/* FORM */}

        {showForm && (
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingBudget
                  ? "Edit Budget"
                  : "Tambah Budget"}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-black"
              >
                Batal
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kategori
                </label>

                <select
                  value={selectedCategoryId}
                  onChange={(event) =>
                    setSelectedCategoryId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Jumlah Budget
                </label>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: 500000"
                  className="w-full rounded-lg border px-3 py-2"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Masukkan angka tanpa titik
                  atau simbol Rp.
                </p>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  {editingBudget
                    ? "Simpan Perubahan"
                    : "Simpan Budget"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* BUDGET LIST */}

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
            Memuat budget...
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="font-semibold">
              Belum ada budget
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Buat budget untuk membantu
              mengontrol pengeluaranmu
              bulan ini.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              + Buat Budget
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {budgets.map((budget) => {
              const progress =
                getProgressWidth(
                  budget.usage
                );

              return (
                <div
                  key={budget.id}
                  className="rounded-xl border bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {budget.category.icon ||
                            "💰"}
                        </span>

                        <h3 className="font-semibold">
                          {budget.category.name}
                        </h3>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Budget{" "}
                        {formatRupiah(
                          budget.amount
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        budget.status
                      )}`}
                    >
                      {getStatusLabel(
                        budget.status
                      )}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        Terpakai{" "}
                        {formatRupiah(
                          budget.spent
                        )}
                      </span>

                      <span>
                        {budget.usage.toFixed(
                          0
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-black transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-500">
                      Sisa
                    </span>

                    <span className="font-semibold">
                      {formatRupiah(
                        budget.remaining
                      )}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-2 border-t pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          budget
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          budget.id
                        )
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}