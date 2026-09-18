"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Edit3,
  Filter,
  Loader2,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Wallet = {
  id: string;
  name: string;
  balance: string;
};

type Category = {
  id: string;
  name: string;
  type: string;
};

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT";
  amount: string;
  transactionDate: string;
  description: string | null;
  wallet: {
    id: string;
    name: string;
  } | null;
  fromWallet: {
    id: string;
    name: string;
  } | null;
  toWallet: {
    id: string;
    name: string;
  } | null;
  category: {
    id: string;
    name: string;
    type: string;
  } | null;
};

type TransactionsClientProps = {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
};

type FormType = "INCOME" | "EXPENSE";

const rupiahFormatter = new Intl.NumberFormat("id-ID");

function formatRupiah(value: string | number | bigint) {
  return `Rp ${rupiahFormatter.format(Number(value))}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateInput(date: string) {
  const parsed = new Date(date);

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthValue(date: string) {
  const parsed = new Date(date);

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function formatMonthLabel(value: string) {
  if (!value) return "Semua Bulan";

  const [year, month] = value.split("-");

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

function getTransactionLabel(type: Transaction["type"]) {
  switch (type) {
    case "INCOME":
      return "Pemasukan";
    case "EXPENSE":
      return "Pengeluaran";
    case "TRANSFER":
      return "Transfer";
    case "ADJUSTMENT":
      return "Penyesuaian";
    default:
      return "Transaksi";
  }
}

function getTransactionIcon(type: Transaction["type"]) {
  switch (type) {
    case "INCOME":
      return ArrowDownLeft;
    case "EXPENSE":
      return ArrowUpRight;
    case "TRANSFER":
      return ArrowLeftRight;
    default:
      return CircleDollarSign;
  }
}

function getTransactionStyles(type: Transaction["type"]) {
  switch (type) {
    case "INCOME":
      return {
        icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        amount: "text-emerald-600",
      };

    case "EXPENSE":
      return {
        icon: "bg-rose-50 text-rose-600 ring-rose-100",
        badge: "bg-rose-50 text-rose-700 ring-rose-100",
        amount: "text-rose-600",
      };

    case "TRANSFER":
      return {
        icon: "bg-sky-50 text-sky-600 ring-sky-100",
        badge: "bg-sky-50 text-sky-700 ring-sky-100",
        amount: "text-sky-600",
      };

    default:
      return {
        icon: "bg-slate-100 text-slate-600 ring-slate-200",
        badge: "bg-slate-100 text-slate-700 ring-slate-200",
        amount: "text-slate-600",
      };
  }
}

function SummaryCard({
  title,
  amount,
  icon: Icon,
  iconClass,
  description,
}: {
  title: string;
  amount: number;
  icon: typeof CircleDollarSign;
  iconClass: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl ${iconClass}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              {formatRupiah(amount)}
            </p>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilter,
  onReset,
  onAdd,
}: {
  hasFilter: boolean;
  onReset: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed bg-background px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <WalletCards className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {hasFilter ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {hasFilter
          ? "Coba ubah kata pencarian atau filter yang digunakan."
          : "Mulai catat pemasukan dan pengeluaranmu agar SharkFin dapat membaca pola keuanganmu."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Reset Filter
          </button>
        )}

        {!hasFilter && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            + Tambah Transaksi
          </button>
        )}
      </div>
    </div>
  );
}

export default function TransactionsClient({
  transactions,
  wallets,
  categories,
}: TransactionsClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const [formType, setFormType] = useState<FormType>("EXPENSE");

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    formatDateInput(new Date().toISOString()),
  );
  const [description, setDescription] = useState("");

  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState(
    formatDateInput(new Date().toISOString()),
  );
  const [transferDescription, setTransferDescription] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.type === formType);
  }, [categories, formType]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount = Number(transaction.amount);

        if (transaction.type === "INCOME") {
          result.income += amount;
        }

        if (transaction.type === "EXPENSE") {
          result.expense += amount;
        }

        if (transaction.type === "TRANSFER") {
          result.transfer += amount;
        }

        return result;
      },
      {
        income: 0,
        expense: 0,
        transfer: 0,
      },
    );
  }, [transactions]);

  const netCashflow = summary.income - summary.expense;

  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !keyword ||
        transaction.description?.toLowerCase().includes(keyword) ||
        transaction.wallet?.name.toLowerCase().includes(keyword) ||
        transaction.fromWallet?.name.toLowerCase().includes(keyword) ||
        transaction.toWallet?.name.toLowerCase().includes(keyword) ||
        transaction.category?.name.toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === "ALL" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "ALL" || transaction.category?.id === categoryFilter;

      const matchesMonth =
        !monthFilter ||
        getMonthValue(transaction.transactionDate) === monthFilter;

      return matchesSearch && matchesType && matchesCategory && matchesMonth;
    });
  }, [transactions, search, typeFilter, categoryFilter, monthFilter]);

  const hasFilter =
    Boolean(search.trim()) ||
    typeFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    Boolean(monthFilter);

  function resetFilters() {
    setSearch("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setMonthFilter("");
  }

  function resetForm() {
    setAmount("");
    setCategoryId("");
    setWalletId(wallets[0]?.id ?? "");
    setTransactionDate(formatDateInput(new Date().toISOString()));
    setDescription("");
    setEditingTransaction(null);
    setError("");
  }

  function openAddModal() {
    resetForm();
    setFormType("EXPENSE");
    setFormOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    if (transaction.type !== "INCOME" && transaction.type !== "EXPENSE") {
      return;
    }

    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setAmount(transaction.amount);
    setWalletId(transaction.wallet?.id ?? "");
    setCategoryId(transaction.category?.id ?? "");
    setTransactionDate(formatDateInput(transaction.transactionDate));
    setDescription(transaction.description ?? "");
    setError("");
    setFormOpen(true);
  }

  function closeFormModal() {
    if (loading) return;

    setFormOpen(false);
    resetForm();
  }

  function openTransferModal() {
    setTransferAmount("");
    setFromWalletId(wallets[0]?.id ?? "");
    setToWalletId(wallets[1]?.id ?? wallets[0]?.id ?? "");
    setTransferDate(formatDateInput(new Date().toISOString()));
    setTransferDescription("");
    setError("");
    setTransferOpen(true);
  }

  function closeTransferModal() {
    if (loading) return;

    setTransferOpen(false);
    setError("");
  }

  function openDeleteModal(transaction: Transaction) {
    setTransactionToDelete(transaction);
    setError("");
    setDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (loading) return;

    setDeleteOpen(false);
    setTransactionToDelete(null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const parsedAmount = Number(amount.replace(/[^\d]/g, ""));

      if (!parsedAmount || parsedAmount <= 0) {
        throw new Error("Nominal transaksi harus lebih besar dari 0.");
      }

      if (!walletId) {
        throw new Error("Pilih wallet terlebih dahulu.");
      }

      if (!categoryId) {
        throw new Error("Pilih kategori transaksi.");
      }

      const payload = {
        type: formType,
        amount: parsedAmount,
        categoryId,
        walletId,
        transactionDate: new Date(`${transactionDate}T00:00:00`).toISOString(),
        description: description.trim() || null,
      };

      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : "/api/transactions";

      const response = await fetch(url, {
        method: editingTransaction ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Gagal menyimpan transaksi.",
        );
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  async function handleTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const parsedAmount = Number(transferAmount.replace(/[^\d]/g, ""));

      if (!parsedAmount || parsedAmount <= 0) {
        throw new Error("Nominal transfer harus lebih besar dari 0.");
      }

      if (!fromWalletId || !toWalletId) {
        throw new Error("Pilih wallet asal dan tujuan.");
      }

      if (fromWalletId === toWalletId) {
        throw new Error("Wallet asal dan tujuan tidak boleh sama.");
      }

      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
          fromWalletId,
          toWalletId,
          transactionDate: new Date(`${transferDate}T00:00:00`).toISOString(),
          description: transferDescription.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Gagal melakukan transfer.",
        );
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!transactionToDelete) return;

    setLoading(true);
    setError("");

    try {
      const url =
        transactionToDelete.type === "TRANSFER"
          ? `/api/transfers/${transactionToDelete.id}`
          : `/api/transactions/${transactionToDelete.id}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Gagal menghapus transaksi.",
        );
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-muted/20">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <CircleDollarSign className="h-3.5 w-3.5" />
                Financial Activity
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Transactions
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Pantau dan kelola seluruh aktivitas keuanganmu dalam satu
                tempat.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={openTransferModal}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Transfer
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex h-11 items-center justify-center gap-2  rounded-xl bg-[#0d63e8] px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
              >
                <span className="text-lg leading-none">+</span>
                Tambah Transaksi
              </button>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Pemasukan"
            amount={summary.income}
            icon={ArrowDownLeft}
            iconClass="bg-emerald-100 text-emerald-600"
            description="Seluruh pemasukan yang tercatat"
          />

          <SummaryCard
            title="Total Pengeluaran"
            amount={summary.expense}
            icon={ArrowUpRight}
            iconClass="bg-rose-100 text-rose-600"
            description="Seluruh pengeluaran yang tercatat"
          />

          <SummaryCard
            title="Total Transfer"
            amount={summary.transfer}
            icon={ArrowLeftRight}
            iconClass="bg-sky-100 text-sky-600"
            description="Perpindahan dana antar wallet"
          />

          <SummaryCard
            title="Net Cashflow"
            amount={Math.abs(netCashflow)}
            icon={CircleDollarSign}
            iconClass={
              netCashflow >= 0
                ? "bg-indigo-100 text-indigo-600"
                : "bg-orange-100 text-orange-600"
            }
            description={
              netCashflow >= 0
                ? "Pemasukan lebih besar dari pengeluaran"
                : "Pengeluaran lebih besar dari pemasukan"
            }
          />
        </section>

        {/* FILTER */}
        <section className="mt-6 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari transaksi, kategori, wallet..."
                className="h-11 w-full rounded-xl border bg-muted/30 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filter
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                {/* TYPE */}
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="ALL">Semua Tipe</option>
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                {/* CATEGORY */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="ALL">Semua Kategori</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                {/* MONTH */}
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="month"
                    value={monthFilter}
                    onChange={(event) => setMonthFilter(event.target.value)}
                    className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-10 rounded-xl px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* LIST HEADER */}
        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>

              <p className="text-sm text-muted-foreground">
                {filteredTransactions.length} transaksi
                {monthFilter ? ` pada ${formatMonthLabel(monthFilter)}` : ""}
              </p>
            </div>

            {hasFilter && (
              <span className="text-xs text-muted-foreground">
                Filter aktif
              </span>
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              hasFilter={hasFilter}
              onReset={resetFilters}
              onAdd={openAddModal}
            />
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);

                const styles = getTransactionStyles(transaction.type);

                const isEditable =
                  transaction.type === "INCOME" ||
                  transaction.type === "EXPENSE";

                return (
                  <article
                    key={transaction.id}
                    className="group rounded-2xl border bg-background p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold sm:text-base">
                                {transaction.description ||
                                  getTransactionLabel(transaction.type)}
                              </h3>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 sm:text-[11px] ${styles.badge}`}
                              >
                                {getTransactionLabel(transaction.type)}
                              </span>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              {transaction.type === "TRANSFER" ? (
                                <>
                                  <span>
                                    {transaction.fromWallet?.name ?? "-"}
                                  </span>

                                  <ArrowLeftRight className="h-3 w-3" />

                                  <span>
                                    {transaction.toWallet?.name ?? "-"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span>
                                    {transaction.category?.name ??
                                      "Tanpa kategori"}
                                  </span>

                                  <span>•</span>

                                  <span>
                                    {transaction.wallet?.name ?? "Tanpa wallet"}
                                  </span>
                                </>
                              )}

                              <span>•</span>

                              <span>
                                {formatDate(transaction.transactionDate)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <p
                              className={`text-base font-bold sm:text-lg ${styles.amount}`}
                            >
                              {transaction.type === "INCOME"
                                ? "+"
                                : transaction.type === "EXPENSE"
                                  ? "-"
                                  : ""}
                              {formatRupiah(transaction.amount)}
                            </p>

                            <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                              {isEditable && (
                                <button
                                  type="button"
                                  onClick={() => openEditModal(transaction)}
                                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                  title="Edit transaksi"
                                  aria-label="Edit transaksi"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => openDeleteModal(transaction)}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600"
                                title="Hapus transaksi"
                                aria-label="Hapus transaksi"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border bg-background shadow-2xl sm:max-w-lg sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <h2 className="font-semibold">
                  {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Catat aktivitas keuanganmu dengan detail.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              {/* TYPE */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tipe Transaksi
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("INCOME");
                      setCategoryId("");
                    }}
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      formType === "INCOME"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "hover:bg-muted"
                    }`}
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    Pemasukan
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("EXPENSE");
                      setCategoryId("");
                    }}
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      formType === "EXPENSE"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "hover:bg-muted"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Pengeluaran
                  </button>
                </div>
              </div>

              {/* AMOUNT */}
              <div>
                <label
                  htmlFor="transaction-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Nominal
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    Rp
                  </span>

                  <input
                    id="transaction-amount"
                    type="text"
                    inputMode="numeric"
                    value={
                      amount
                        ? rupiahFormatter.format(
                            Number(amount.replace(/[^\d]/g, "")),
                          )
                        : ""
                    }
                    onChange={(event) =>
                      setAmount(event.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="500.000"
                    className="h-14 w-full rounded-xl border bg-muted/20 pl-11 pr-4 text-lg font-semibold outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Contoh: 500000
                </p>
              </div>

              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="transaction-category"
                  className="mb-2 block text-sm font-medium"
                >
                  Kategori
                </label>

                <div className="relative">
                  <select
                    id="transaction-category"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Pilih kategori</option>

                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* WALLET */}
              <div>
                <label
                  htmlFor="transaction-wallet"
                  className="mb-2 block text-sm font-medium"
                >
                  Wallet
                </label>

                <div className="relative">
                  <select
                    id="transaction-wallet"
                    value={walletId}
                    onChange={(event) => setWalletId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Pilih wallet</option>

                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} — {formatRupiah(wallet.balance)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* DATE */}
              <div>
                <label
                  htmlFor="transaction-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Tanggal
                </label>

                <input
                  id="transaction-date"
                  type="date"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="transaction-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Deskripsi
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </label>

                <input
                  id="transaction-description"
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Contoh: Makan siang di kampus"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={loading}
                  className="h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                  {loading
                    ? "Menyimpan..."
                    : editingTransaction
                      ? "Simpan Perubahan"
                      : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border bg-background shadow-2xl sm:max-w-lg sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <h2 className="font-semibold">Transfer Antar Wallet</h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pindahkan dana tanpa mengubah total balance.
                </p>
              </div>

              <button
                type="button"
                onClick={closeTransferModal}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-5 p-5 sm:p-6">
              {/* FROM */}
              <div>
                <label
                  htmlFor="from-wallet"
                  className="mb-2 block text-sm font-medium"
                >
                  Dari Wallet
                </label>

                <div className="relative">
                  <select
                    id="from-wallet"
                    value={fromWalletId}
                    onChange={(event) => setFromWalletId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} — {formatRupiah(wallet.balance)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* VISUAL TRANSFER */}
              <div className="flex justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <ArrowDownLeft className="h-4 w-4 rotate-[-45deg]" />
                </div>
              </div>

              {/* TO */}
              <div>
                <label
                  htmlFor="to-wallet"
                  className="mb-2 block text-sm font-medium"
                >
                  Ke Wallet
                </label>

                <div className="relative">
                  <select
                    id="to-wallet"
                    value={toWalletId}
                    onChange={(event) => setToWalletId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} — {formatRupiah(wallet.balance)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* AMOUNT */}
              <div>
                <label
                  htmlFor="transfer-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Nominal Transfer
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    Rp
                  </span>

                  <input
                    id="transfer-amount"
                    type="text"
                    inputMode="numeric"
                    value={
                      transferAmount
                        ? rupiahFormatter.format(
                            Number(transferAmount.replace(/[^\d]/g, "")),
                          )
                        : ""
                    }
                    onChange={(event) =>
                      setTransferAmount(
                        event.target.value.replace(/[^\d]/g, ""),
                      )
                    }
                    placeholder="200.000"
                    className="h-14 w-full rounded-xl border bg-muted/20 pl-11 pr-4 text-lg font-semibold outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* DATE */}
              <div>
                <label
                  htmlFor="transfer-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Tanggal
                </label>

                <input
                  id="transfer-date"
                  type="date"
                  value={transferDate}
                  onChange={(event) => setTransferDate(event.target.value)}
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="transfer-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Deskripsi
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </label>

                <input
                  id="transfer-description"
                  type="text"
                  value={transferDescription}
                  onChange={(event) =>
                    setTransferDescription(event.target.value)
                  }
                  placeholder="Contoh: Isi saldo GoPay"
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeTransferModal}
                  disabled={loading}
                  className="h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                  {loading ? "Memproses..." : "Transfer Dana"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteOpen && transactionToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border bg-background p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">Hapus transaksi?</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Transaksi{" "}
              <span className="font-medium text-foreground">
                {transactionToDelete.description ||
                  getTransactionLabel(transactionToDelete.type)}
              </span>{" "}
              sebesar{" "}
              <span className="font-semibold text-foreground">
                {formatRupiah(transactionToDelete.amount)}
              </span>{" "}
              akan dihapus dan perubahan balance akan dikembalikan.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={loading}
                className="h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                {loading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
