"use client";

import { useMemo, useState } from "react";

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
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatRecurrence(value: Recurrence) {
  switch (value) {
    case "DAILY":
      return "Setiap hari";
    case "WEEKLY":
      return "Setiap minggu";
    case "MONTHLY":
      return "Setiap bulan";
    case "YEARLY":
      return "Setiap tahun";
  }
}

export default function ScheduledExpensesClient({
  initialExpenses,
  wallets,
}: Props) {
  const [expenses, setExpenses] =
    useState<ScheduledExpense[]>(initialExpenses);

  const [showForm, setShowForm] =
    useState(false);

  const [editingExpense, setEditingExpense] =
    useState<ScheduledExpense | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [recurrence, setRecurrence] =
    useState<Recurrence>("MONTHLY");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const activeExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) => expense.isActive,
      ),
    [expenses],
  );

  const upcomingTotal = useMemo(
    () =>
      activeExpenses.reduce(
        (total, expense) =>
          total + Number(expense.amount),
        0,
      ),
    [activeExpenses],
  );

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

      const data = await response.json();

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
    setShowForm(false);
    setError("");
  };

  const handleEdit = (
    expense: ScheduledExpense,
  ) => {
    setEditingExpense(expense);
    setName(expense.name);
    setAmount(expense.amount);
    setWalletId(expense.wallet.id);
    setNextDate(
      expense.nextDate.slice(0, 10),
    );
    setRecurrence(expense.recurrence);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
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
        setError("Wallet wajib dipilih.");
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

      const response = await fetch(url, {
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
      });

      const data = await response.json();

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
    }
  };

  const handleToggle = async (
    expense: ScheduledExpense,
  ) => {
    try {
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
            isActive: !expense.isActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal mengubah status.",
        );
      }

      await loadExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    }
  };

  const handleDelete = async (
    expense: ScheduledExpense,
  ) => {
    const confirmed =
      window.confirm(
        `Hapus scheduled expense "${expense.name}"?`,
      );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/scheduled-expenses/${expense.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal menghapus scheduled expense.",
        );
      }

      await loadExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan.",
      );
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Scheduled Expenses
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Kelola pengeluaran rutin dan
              pembayaran yang akan datang.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setName("");
              setAmount("");
              setWalletId("");
              setNextDate("");
              setRecurrence("MONTHLY");
              setShowForm(true);
              setError("");
            }}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Tambah Pengeluaran
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Pengeluaran Aktif
            </p>

            <p className="mt-2 text-2xl font-bold">
              {activeExpenses.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Nominal
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatRupiah(upcomingTotal)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Berdasarkan seluruh scheduled
              expense aktif.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Wallet Aktif
            </p>

            <p className="mt-2 text-2xl font-bold">
              {wallets.length}
            </p>
          </div>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingExpense
                    ? "Edit Scheduled Expense"
                    : "Tambah Scheduled Expense"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Contoh: Internet Rp300.000
                  setiap tanggal 10.
                </p>
              </div>

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
                  Nama Pengeluaran
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Contoh: Internet"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nominal
                </label>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                  placeholder="Contoh: 300000"
                  className="w-full rounded-lg border px-3 py-2"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Masukkan angka tanpa titik
                  atau simbol Rp.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Wallet
                </label>

                <select
                  value={walletId}
                  onChange={(event) =>
                    setWalletId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">
                    Pilih wallet
                  </option>

                  {wallets.map((wallet) => (
                    <option
                      key={wallet.id}
                      value={wallet.id}
                    >
                      {wallet.name} —{" "}
                      {formatRupiah(
                        wallet.balance,
                      )}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-gray-500">
                  Pengeluaran akan menggunakan
                  wallet ini.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Pengeluaran Berikutnya
                </label>

                <input
                  type="date"
                  value={nextDate}
                  onChange={(event) =>
                    setNextDate(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Pengulangan
                </label>

                <select
                  value={recurrence}
                  onChange={(event) =>
                    setRecurrence(
                      event.target
                        .value as Recurrence,
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
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
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  {editingExpense
                    ? "Simpan Perubahan"
                    : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
            Memuat scheduled expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <div className="text-4xl">📅</div>

            <h2 className="mt-3 font-semibold">
              Belum ada scheduled expense
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tambahkan pengeluaran rutin seperti
              internet, kost, atau langganan.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              + Tambah Pengeluaran
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        📅
                      </span>

                      <h3 className="font-semibold">
                        {expense.name}
                      </h3>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Wallet:{" "}
                      {expense.wallet.name}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      expense.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {expense.isActive
                      ? "Aktif"
                      : "Nonaktif"}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    Nominal
                  </p>

                  <p className="text-2xl font-bold">
                    {formatRupiah(
                      expense.amount,
                    )}
                  </p>
                </div>

                <div className="mt-5 space-y-3 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Berikutnya
                    </span>

                    <span className="font-medium">
                      {formatDate(
                        expense.nextDate,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Pengulangan
                    </span>

                    <span>
                      {formatRecurrence(
                        expense.recurrence,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Saldo wallet
                    </span>

                    <span>
                      {formatRupiah(
                        expense.wallet
                          .balance,
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(expense)
                    }
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(expense)
                    }
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {expense.isActive
                      ? "Nonaktifkan"
                      : "Aktifkan"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(expense)
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}