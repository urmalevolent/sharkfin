"use client";

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
    }
  };

  const handleDelete = async (
    goalId: string
  ) => {
    const confirmed =
      window.confirm(
        "Apakah Anda yakin ingin menghapus goal ini?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          `/api/goals/${goalId}`,
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

      await loadGoals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
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

    return {
      totalTarget,
      totalCurrent,
      completed,
    };
  }, [goals]);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Financial Goals
            </h1>

            <p className="text-sm text-gray-500">
              Tentukan target keuangan
              dan pantau progresnya.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingGoal(null);
              setName("");
              setTargetAmount("");
              setDeadline("");
              setWalletId("");
              setShowForm(true);
              setError("");
            }}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Tambah Goal
          </button>
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
              Total Target
            </p>

            <p className="mt-2 text-xl font-bold">
              {formatRupiah(
                summary.totalTarget
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Terkumpul
            </p>

            <p className="mt-2 text-xl font-bold">
              {formatRupiah(
                summary.totalCurrent
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Goal Selesai
            </p>

            <p className="mt-2 text-xl font-bold">
              {summary.completed}
            </p>
          </div>

        </div>

        {/* FORM */}

        {showForm && (
          <div className="rounded-xl border bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingGoal
                    ? "Edit Goal"
                    : "Tambah Goal"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Hubungkan dengan wallet
                  jika ingin progress
                  mengikuti saldo wallet.
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

              {/* NAME */}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Goal
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: Laptop"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              {/* TARGET */}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Target
                </label>

                <input
                  type="number"
                  min="1"
                  value={targetAmount}
                  onChange={(event) =>
                    setTargetAmount(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: 12000000"
                  className="w-full rounded-lg border px-3 py-2"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Masukkan angka tanpa
                  titik atau simbol Rp.
                </p>
              </div>

              {/* WALLET */}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Wallet
                </label>

                <select
                  value={walletId}
                  onChange={(event) =>
                    setWalletId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
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

                <p className="mt-1 text-xs text-gray-500">
                  Progress goal akan
                  mengikuti saldo wallet.
                </p>
              </div>

              {/* DEADLINE */}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deadline
                </label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Opsional. Digunakan untuk
                  menghitung kebutuhan
                  tabungan per bulan.
                </p>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  {editingGoal
                    ? "Simpan Perubahan"
                    : "Simpan Goal"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* GOALS */}

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
            Memuat goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">

            <div className="text-4xl">
              🎯
            </div>

            <h2 className="mt-3 font-semibold">
              Belum ada financial goal
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Buat target keuangan pertama
              untuk mulai merencanakan
              masa depanmu.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              + Buat Goal
            </button>

          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">

            {goals.map((goal) => {
              const progress =
                getProgressWidth(
                  goal.progress
                );

              return (
                <div
                  key={goal.id}
                  className="rounded-xl border bg-white p-5"
                >

                  {/* TITLE */}

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          🎯
                        </span>

                        <h3 className="font-semibold">
                          {goal.name}
                        </h3>
                      </div>

                      {goal.wallet && (
                        <p className="mt-1 text-xs text-gray-500">
                          Wallet:{" "}
                          {goal.wallet.name}
                        </p>
                      )}
                    </div>

                    {goal.completed && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Selesai
                      </span>
                    )}

                  </div>

                  {/* AMOUNT */}

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Terkumpul
                      </p>

                      <p className="text-xl font-bold">
                        {formatRupiah(
                          goal.currentAmount
                        )}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500">
                      dari{" "}
                      {formatRupiah(
                        goal.targetAmount
                      )}
                    </p>
                  </div>

                  {/* PROGRESS */}

                  <div className="mt-4">

                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        Progress
                      </span>

                      <span className="font-medium">
                        {goal.progress.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-black transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 space-y-2 border-t pt-4 text-sm">

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Sisa
                      </span>

                      <span className="font-medium">
                        {formatRupiah(
                          goal.remaining
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Deadline
                      </span>

                      <span>
                        {formatDate(
                          goal.deadline
                        )}
                      </span>
                    </div>

                    {goal.requiredMonthlySaving !==
                      null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Perlu / bulan
                        </span>

                        <span className="font-medium">
                          {formatRupiah(
                            goal.requiredMonthlySaving
                          )}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* ACTION */}

                  <div className="mt-5 flex gap-2 border-t pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(goal)
                      }
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          goal.id
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