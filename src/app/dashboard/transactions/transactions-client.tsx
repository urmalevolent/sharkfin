"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Wallet {
  id: string;
  name: string;
  balance: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  type: string;
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
}

interface TransactionsClientProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
}

const formatRupiah = (amount: string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export default function TransactionsClient({
  transactions,
  wallets,
  categories,
}: TransactionsClientProps) {
  const router = useRouter();

  // =========================
  // FORM STATE
  // =========================

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    "EXPENSE"
  );

  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================
  // TRANSFER STATE
  // =========================

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transferDescription, setTransferDescription] = useState("");
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false);
  const [transferError, setTransferError] = useState("");

  // =========================
  // DELETE STATE
  // =========================

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const [isDeleteSubmitting, setIsDeleteSubmitting] =
    useState(false);

  // =========================
  // FILTER CATEGORY
  // =========================

  const filteredCategories = categories.filter(
    (category) =>
      category.type ===
      (type === "INCOME" ? "INCOME" : "EXPENSE")
  );

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setType("EXPENSE");
    setAmount("");
    setWalletId("");
    setCategoryId("");
    setTransactionDate(
      new Date().toISOString().split("T")[0]
    );
    setDescription("");
    setErrorMessage("");
  };

  // =========================
  // OPEN ADD
  // =========================

  const handleOpenAdd = () => {
    resetForm();

    if (wallets.length > 0) {
      setWalletId(wallets[0].id);
    }

    setIsAddOpen(true);
  };

  // =========================
  // CLOSE ADD
  // =========================

  const handleCloseAdd = () => {
    if (isSubmitting) return;

    resetForm();
    setIsAddOpen(false);
  };

  // =========================
  // TYPE CHANGE
  // =========================

  const handleTypeChange = (
    newType: "INCOME" | "EXPENSE"
  ) => {
    setType(newType);
    setCategoryId("");
    setErrorMessage("");
  };

  // =========================
  // CREATE TRANSACTION
  // =========================

  const handleAddTransaction = async () => {
    setErrorMessage("");

    if (!amount.trim()) {
      setErrorMessage("Jumlah transaksi wajib diisi.");
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isSafeInteger(numericAmount) ||
      numericAmount <= 0
    ) {
      setErrorMessage(
        "Jumlah transaksi harus berupa angka lebih dari Rp0."
      );
      return;
    }

    if (!walletId) {
      setErrorMessage("Wallet wajib dipilih.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Kategori wajib dipilih.");
      return;
    }

    if (!transactionDate) {
      setErrorMessage("Tanggal transaksi wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          walletId,
          categoryId,
          transactionDate,
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(
          result.message ||
            "Gagal menambahkan transaksi."
        );
        return;
      }

      handleCloseAdd();

      router.refresh();
    } catch (error) {
      console.error(
        "Add transaction error:",
        error
      );

      setErrorMessage(
        "Terjadi kesalahan saat menambahkan transaksi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // TRANSFER
  // =========================

  const handleOpenTransfer = () => {
    setTransferError("");
    setTransferAmount("");
    setTransferDate(new Date().toISOString().split("T")[0]);
    setTransferDescription("");
    setFromWalletId(wallets[0]?.id ?? "");
    setToWalletId(wallets[1]?.id ?? "");
    setIsTransferOpen(true);
  };

  const handleCloseTransfer = () => {
    if (isTransferSubmitting) return;

    setIsTransferOpen(false);
    setTransferError("");
  };

  const handleAddTransfer = async () => {
    setTransferError("");

    if (!transferAmount.trim()) {
      setTransferError("Jumlah transfer wajib diisi.");
      return;
    }

    const numericAmount = Number(transferAmount);

    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
      setTransferError("Jumlah transfer harus berupa angka lebih dari Rp0.");
      return;
    }

    if (!fromWalletId) {
      setTransferError("Wallet asal wajib dipilih.");
      return;
    }

    if (!toWalletId) {
      setTransferError("Wallet tujuan wajib dipilih.");
      return;
    }

    if (fromWalletId === toWalletId) {
      setTransferError("Wallet asal dan tujuan harus berbeda.");
      return;
    }

    if (!transferDate) {
      setTransferError("Tanggal transfer wajib diisi.");
      return;
    }

    const sourceWallet = wallets.find((wallet) => wallet.id === fromWalletId);

    if (sourceWallet && BigInt(numericAmount) > BigInt(sourceWallet.balance)) {
      setTransferError(
        `Saldo ${sourceWallet.name} tidak cukup untuk transfer ini.`
      );
      return;
    }

    setIsTransferSubmitting(true);

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromWalletId,
          toWalletId,
          amount: numericAmount,
          transactionDate: transferDate,
          description: transferDescription.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setTransferError(result.message || "Gagal melakukan transfer.");
        return;
      }

      setIsTransferOpen(false);
      setTransferError("");
      router.refresh();
    } catch (error) {
      console.error("Add transfer error:", error);
      setTransferError("Terjadi kesalahan saat melakukan transfer.");
    } finally {
      setIsTransferSubmitting(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleOpenDelete = (
    transaction: Transaction
  ) => {
    setDeletingTransaction(transaction);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (isDeleteSubmitting) return;

    setDeletingTransaction(null);
    setIsDeleteOpen(false);
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;

    setIsDeleteSubmitting(true);

    try {
      const endpoint =
        deletingTransaction.type === "TRANSFER"
          ? `/api/transfers/${deletingTransaction.id}`
          : `/api/transactions/${deletingTransaction.id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Gagal menghapus transaksi."
        );
        return;
      }

      handleCloseDelete();

      router.refresh();
    } catch (error) {
      console.error(
        "Delete transaction error:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus transaksi."
      );
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  return (
    <>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                Transaksi
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Catat dan kelola semua pemasukan dan
                pengeluaranmu.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleOpenTransfer}
                disabled={wallets.length < 2}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↔ Transfer
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                disabled={wallets.length === 0}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Tambah Transaksi
              </button>
            </div>
          </div>

          {/* EMPTY WALLET WARNING */}
          {wallets.length === 0 && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Kamu belum memiliki wallet aktif.
              Tambahkan wallet terlebih dahulu sebelum
              membuat transaksi.
            </div>
          )}

          {/* TRANSACTION LIST */}
          <section>
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <h2 className="font-semibold">
                  Belum ada transaksi
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Mulai catat pemasukan atau pengeluaran
                  pertamamu.
                </p>

                {wallets.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
                  >
                    + Tambah Transaksi
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="border-b px-5 py-4">
                  <h2 className="font-semibold">
                    Riwayat Transaksi
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {transactions.length} transaksi
                  </p>
                </div>

                <div className="divide-y">
                  {transactions.map((transaction) => {
                    const isIncome = transaction.type === "INCOME";
                    const isTransfer = transaction.type === "TRANSFER";

                    return (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-4 px-5 py-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-4">

                          {/* ICON */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                              isTransfer
                                ? "bg-blue-100 text-blue-700"
                                : isIncome
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isTransfer ? "↔" : isIncome ? "+" : "-"}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">
                                {isTransfer
                                  ? "Transfer"
                                  : transaction.category?.name || "Tanpa kategori"}
                              </p>

                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  isTransfer
                                    ? "bg-blue-100 text-blue-700"
                                    : isIncome
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isTransfer ? "Transfer" : isIncome ? "Income" : "Expense"}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {isTransfer
                                ? `${transaction.fromWallet?.name || "Wallet asal"} → ${transaction.toWallet?.name || "Wallet tujuan"}`
                                : transaction.wallet?.name || "Wallet tidak tersedia"}
                              {" • "}
                              {formatDate(transaction.transactionDate)}
                            </p>

                            {transaction.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <p
                            className={`font-semibold ${
                              isTransfer
                                ? "text-blue-600"
                                : isIncome
                                  ? "text-green-600"
                                  : "text-red-600"
                            }`}
                          >
                            {isTransfer ? "" : isIncome ? "+" : "-"}
                            {formatRupiah(transaction.amount)}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDelete(
                                transaction
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =========================
          ADD TRANSACTION MODAL
      ========================= */}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >

            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Tambah Transaksi
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Catat pemasukan atau pengeluaran.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAdd}
                disabled={isSubmitting}
                className="text-xl text-muted-foreground transition hover:text-foreground"
              >
                ×
              </button>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="space-y-5">

              {/* TYPE */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Jenis Transaksi
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange("EXPENSE")
                    }
                    disabled={isSubmitting}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                      type === "EXPENSE"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "hover:bg-muted"
                    }`}
                  >
                    🔴 Expense
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange("INCOME")
                    }
                    disabled={isSubmitting}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                      type === "INCOME"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "hover:bg-muted"
                    }`}
                  >
                    🟢 Income
                  </button>
                </div>
              </div>

              {/* AMOUNT */}
              <div>
                <label
                  htmlFor="transaction-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Jumlah
                </label>

                <input
                  id="transaction-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="Contoh: 50000"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Masukkan angka saja, tanpa Rp atau titik.
                </p>
              </div>

              {/* WALLET */}
              <div>
                <label
                  htmlFor="transaction-wallet"
                  className="mb-2 block text-sm font-medium"
                >
                  Wallet
                </label>

                <select
                  id="transaction-wallet"
                  value={walletId}
                  onChange={(event) =>
                    setWalletId(event.target.value)
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                      {formatRupiah(wallet.balance)}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Pilih sumber dana transaksi ini.
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

                <select
                  id="transaction-category"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    Pilih kategori
                  </option>

                  {filteredCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
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
                  onChange={(event) =>
                    setTransactionDate(
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Masukkan tanggal saat transaksi terjadi.
                </p>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="transaction-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Deskripsi
                </label>

                <textarea
                  id="transaction-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: Makan siang di kampus"
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseAdd}
                disabled={isSubmitting}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleAddTransaction}
                disabled={isSubmitting}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          TRANSFER MODAL
      ========================= */}

      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Transfer Wallet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pindahkan saldo dari satu wallet ke wallet lainnya.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseTransfer}
                disabled={isTransferSubmitting}
                className="text-xl text-muted-foreground transition hover:text-foreground"
              >
                ×
              </button>
            </div>

            {transferError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {transferError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="transfer-from-wallet"
                  className="mb-2 block text-sm font-medium"
                >
                  Dari Wallet
                </label>

                <select
                  id="transfer-from-wallet"
                  value={fromWalletId}
                  onChange={(event) => setFromWalletId(event.target.value)}
                  disabled={isTransferSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Pilih wallet asal</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} — {formatRupiah(wallet.balance)}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Saldo akan dikurangi dari wallet ini.
                </p>
              </div>

              <div>
                <label
                  htmlFor="transfer-to-wallet"
                  className="mb-2 block text-sm font-medium"
                >
                  Ke Wallet
                </label>

                <select
                  id="transfer-to-wallet"
                  value={toWalletId}
                  onChange={(event) => setToWalletId(event.target.value)}
                  disabled={isTransferSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Pilih wallet tujuan</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Saldo akan ditambahkan ke wallet ini.
                </p>
              </div>

              <div>
                <label
                  htmlFor="transfer-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Jumlah
                </label>

                <input
                  id="transfer-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                  placeholder="Contoh: 200000"
                  disabled={isTransferSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Masukkan angka saja, tanpa Rp atau titik.
                </p>
              </div>

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
                  disabled={isTransferSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="transfer-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Deskripsi
                </label>

                <textarea
                  id="transfer-description"
                  value={transferDescription}
                  onChange={(event) => setTransferDescription(event.target.value)}
                  placeholder="Contoh: Isi saldo GoPay"
                  disabled={isTransferSubmitting}
                  rows={3}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseTransfer}
                disabled={isTransferSubmitting}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleAddTransfer}
                disabled={isTransferSubmitting || wallets.length < 2}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isTransferSubmitting ? "Memproses..." : "Simpan Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          DELETE MODAL
      ========================= */}

      {isDeleteOpen && deletingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-xl font-bold">
              Hapus Transaksi?
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Apakah kamu yakin ingin menghapus transaksi
              ini?
            </p>

            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">
                {deletingTransaction.category?.name ||
                  "Tanpa kategori"}
              </p>

              <p
                className={`mt-1 font-semibold ${
                  deletingTransaction.type ===
                  "INCOME"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {deletingTransaction.type ===
                "INCOME"
                  ? "+"
                  : "-"}
                {formatRupiah(
                  deletingTransaction.amount
                )}
              </p>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Saldo wallet juga akan dikembalikan sesuai
              efek transaksi tersebut.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDelete}
                disabled={isDeleteSubmitting}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={isDeleteSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {isDeleteSubmitting
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}