"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: string;
  isActive: boolean;
}

interface WalletsClientProps {
  wallets: Wallet[];
  totalBalance: string;
}

const formatRupiah = (amount: string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const walletTypeLabels: Record<string, string> = {
  CASH: "Cash",
  BANK: "Bank",
  E_WALLET: "E-Wallet",
  SAVINGS: "Tabungan",
  OTHER: "Lainnya",
};

export default function WalletsClient({
  wallets,
  totalBalance,
}: WalletsClientProps) {
  const router = useRouter();

  // =========================
  // ADD WALLET STATE
  // =========================
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addErrorMessage, setAddErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("BANK");
  const [balance, setBalance] = useState("");

  // =========================
  // EDIT WALLET STATE
  // =========================
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(
    null
  );

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("BANK");

  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // =========================
  // DEACTIVATE STATE
  // =========================
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [deactivatingWallet, setDeactivatingWallet] =
    useState<Wallet | null>(null);

  const [deactivateErrorMessage, setDeactivateErrorMessage] =
    useState("");
  const [isDeactivateSubmitting, setIsDeactivateSubmitting] =
    useState(false);

  // =========================
  // ACTIVATE WALLET STATE
  // =========================
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [activatingWallet, setActivatingWallet] = useState<Wallet | null>(
    null
  );

  const [activateErrorMessage, setActivateErrorMessage] = useState("");
  const [isActivateSubmitting, setIsActivateSubmitting] = useState(false);

  // =========================
  // ADD WALLET
  // =========================
  const resetAddForm = () => {
    setName("");
    setType("BANK");
    setBalance("");
    setAddErrorMessage("");
  };

  const handleCloseAdd = () => {
    if (isSubmitting) return;

    resetAddForm();
    setIsAddOpen(false);
  };

  const handleAddWallet = async () => {
    setAddErrorMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setAddErrorMessage("Nama wallet wajib diisi.");
      return;
    }

    if (trimmedName.length < 2) {
      setAddErrorMessage("Nama wallet minimal 2 karakter.");
      return;
    }

    if (!balance.trim()) {
      setAddErrorMessage("Saldo awal wajib diisi.");
      return;
    }

    const numericBalance = Number(balance);

    if (!Number.isInteger(numericBalance)) {
      setAddErrorMessage("Saldo harus berupa angka bulat.");
      return;
    }

    if (numericBalance < 0) {
      setAddErrorMessage("Saldo tidak boleh kurang dari Rp0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          type,
          balance: numericBalance,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setAddErrorMessage(
          result.message || "Gagal menambahkan wallet."
        );
        return;
      }

      resetAddForm();
      setIsAddOpen(false);

      router.refresh();
    } catch (error) {
      console.error("Add wallet error:", error);

      setAddErrorMessage(
        "Terjadi kesalahan saat menambahkan wallet."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // EDIT WALLET
  // =========================
  const handleOpenEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);

    setEditName(wallet.name);
    setEditType(wallet.type);

    setEditErrorMessage("");
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (isEditSubmitting) return;

    setEditingWallet(null);
    setEditName("");
    setEditType("BANK");
    setEditErrorMessage("");

    setIsEditOpen(false);
  };

  const handleEditWallet = async () => {
    if (!editingWallet) return;

    setEditErrorMessage("");

    const trimmedName = editName.trim();

    if (!trimmedName) {
      setEditErrorMessage("Nama wallet wajib diisi.");
      return;
    }

    if (trimmedName.length < 2) {
      setEditErrorMessage("Nama wallet minimal 2 karakter.");
      return;
    }

    setIsEditSubmitting(true);

    try {
      const response = await fetch(
        `/api/wallets/${editingWallet.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            type: editType,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setEditErrorMessage(
          result.message || "Gagal mengubah wallet."
        );
        return;
      }

      handleCloseEdit();

      router.refresh();
    } catch (error) {
      console.error("Edit wallet error:", error);

      setEditErrorMessage(
        "Terjadi kesalahan saat mengubah wallet."
      );
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // =========================
  // DEACTIVATE WALLET
  // =========================
  const handleOpenDeactivate = (wallet: Wallet) => {
    setDeactivatingWallet(wallet);
    setDeactivateErrorMessage("");
    setIsDeactivateOpen(true);
  };

  const handleCloseDeactivate = () => {
    if (isDeactivateSubmitting) return;

    setDeactivatingWallet(null);
    setDeactivateErrorMessage("");
    setIsDeactivateOpen(false);
  };

  const handleDeactivateWallet = async () => {
    if (!deactivatingWallet) return;

    setDeactivateErrorMessage("");
    setIsDeactivateSubmitting(true);

    try {
      const response = await fetch(
        `/api/wallets/${deactivatingWallet.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setDeactivateErrorMessage(
          result.message || "Gagal menonaktifkan wallet."
        );
        return;
      }

      handleCloseDeactivate();

      router.refresh();
    } catch (error) {
      console.error("Deactivate wallet error:", error);

      setDeactivateErrorMessage(
        "Terjadi kesalahan saat menonaktifkan wallet."
      );
    } finally {
      setIsDeactivateSubmitting(false);
    }
  };

  // =========================
  // ACTIVATE WALLET
  // =========================
  const handleOpenActivate = (wallet: Wallet) => {
    setActivatingWallet(wallet);
    setActivateErrorMessage("");
    setIsActivateOpen(true);
  };

  const handleCloseActivate = () => {
    if (isActivateSubmitting) return;

    setActivatingWallet(null);
    setActivateErrorMessage("");
    setIsActivateOpen(false);
  };

  const handleActivateWallet = async () => {
    if (!activatingWallet) return;

    setActivateErrorMessage("");
    setIsActivateSubmitting(true);

    try {
      const response = await fetch(
        `/api/wallets/${activatingWallet.id}/activate`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setActivateErrorMessage(
          result.message || "Gagal mengaktifkan wallet."
        );
        return;
      }

      handleCloseActivate();

      router.refresh();
    } catch (error) {
      console.error("Activate wallet error:", error);

      setActivateErrorMessage(
        "Terjadi kesalahan saat mengaktifkan wallet."
      );
    } finally {
      setIsActivateSubmitting(false);
    }
  };

  const activeWallets = wallets.filter(
    (wallet) => wallet.isActive
  );

  const inactiveWallets = wallets.filter(
    (wallet) => !wallet.isActive
  );

  return (
    <>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          {/* HEADER */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Wallet</h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Kelola semua sumber uang yang kamu miliki.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
            >
              + Tambah Wallet
            </button>
          </div>

          {/* TOTAL BALANCE */}
          <section className="mb-8 rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Total Balance
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {formatRupiah(totalBalance)}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Total saldo dari semua wallet aktif.
            </p>
          </section>

          {/* WALLET LIST */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Wallet Saya
              </h2>
            </div>

            {activeWallets.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <h3 className="font-semibold">
                  Belum ada wallet aktif
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Tambahkan wallet pertamamu untuk mulai
                  mengelola saldo.
                </p>

                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  + Tambah Wallet
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="rounded-2xl border bg-card p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {wallet.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {walletTypeLabels[wallet.type] ??
                            wallet.type}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Aktif
                      </span>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs text-muted-foreground">
                        Saldo
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {formatRupiah(wallet.balance)}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(wallet)}
                        className="rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDeactivate(wallet)
                        }
                        className="rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
                      >
                        Nonaktifkan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =========================
              INACTIVE WALLETS
          ========================= */}
          {inactiveWallets.length > 0 && (
            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  Wallet Nonaktif
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Wallet yang dinonaktifkan tetap tersimpan dan dapat
                  diaktifkan kembali kapan saja.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactiveWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="rounded-2xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900 dark:bg-red-950/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {wallet.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {walletTypeLabels[wallet.type] ??
                            wallet.type}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Nonaktif
                      </span>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs text-muted-foreground">
                        Saldo terakhir
                      </p>

                      <p className="mt-1 text-xl font-bold text-muted-foreground">
                        {formatRupiah(wallet.balance)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenActivate(wallet)}
                      className="mt-5 w-full rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/40"
                    >
                      Aktifkan Kembali
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* =========================
          ADD WALLET MODAL
      ========================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Tambah Wallet
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tambahkan sumber uang baru ke SharkFin.
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

            {addErrorMessage && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {addErrorMessage}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="wallet-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Nama Wallet
                </label>

                <input
                  id="wallet-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Contoh: BCA, GoPay, Cash"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="wallet-type"
                  className="mb-2 block text-sm font-medium"
                >
                  Tipe Wallet
                </label>

                <select
                  id="wallet-type"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value)
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="BANK">Bank</option>
                  <option value="E_WALLET">E-Wallet</option>
                  <option value="CASH">Cash</option>
                  <option value="SAVINGS">Tabungan</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="wallet-balance"
                  className="mb-2 block text-sm font-medium"
                >
                  Saldo Awal
                </label>

                <input
                  id="wallet-balance"
                  type="number"
                  min="0"
                  step="1"
                  value={balance}
                  onChange={(event) =>
                    setBalance(event.target.value)
                  }
                  placeholder="Contoh: 500000"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Masukkan angka saja, tanpa Rp atau titik.
                </p>
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
                onClick={handleAddWallet}
                disabled={isSubmitting}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Wallet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          EDIT WALLET MODAL
      ========================= */}
      {isEditOpen && editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Edit Wallet
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Ubah informasi wallet kamu.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isEditSubmitting}
                className="text-xl text-muted-foreground transition hover:text-foreground"
              >
                ×
              </button>
            </div>

            {editErrorMessage && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {editErrorMessage}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="edit-wallet-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Nama Wallet
                </label>

                <input
                  id="edit-wallet-name"
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                  placeholder="Contoh: BCA, GoPay, Cash"
                  disabled={isEditSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-wallet-type"
                  className="mb-2 block text-sm font-medium"
                >
                  Tipe Wallet
                </label>

                <select
                  id="edit-wallet-type"
                  value={editType}
                  onChange={(event) =>
                    setEditType(event.target.value)
                  }
                  disabled={isEditSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="BANK">Bank</option>
                  <option value="E_WALLET">E-Wallet</option>
                  <option value="CASH">Cash</option>
                  <option value="SAVINGS">Tabungan</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              {/* SALDO READ ONLY */}
              <div>
                <label
                  htmlFor="edit-wallet-balance"
                  className="mb-2 block text-sm font-medium"
                >
                  Saldo
                </label>

                <input
                  id="edit-wallet-balance"
                  type="text"
                  value={formatRupiah(editingWallet.balance)}
                  disabled
                  className="w-full rounded-lg border bg-muted px-3 py-2.5 text-sm text-muted-foreground"
                />

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Saldo tidak dapat diubah dari menu Edit.
                  Gunakan transaksi untuk mengubah saldo.
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isEditSubmitting}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleEditWallet}
                disabled={isEditSubmitting}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
              >
                {isEditSubmitting
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          DEACTIVATE MODAL
      ========================= */}
      {isDeactivateOpen && deactivatingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-xl font-bold">
              Nonaktifkan Wallet?
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Apakah kamu yakin ingin menonaktifkan wallet{" "}
              <span className="font-semibold text-foreground">
                {deactivatingWallet.name}
              </span>
              ?
            </p>

            <p className="mt-3 text-sm text-muted-foreground">
              Wallet tidak akan dihapus dari database. Riwayat
              transaksi tetap aman dan wallet tidak akan digunakan
              sebagai wallet aktif.
            </p>

            {deactivateErrorMessage && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deactivateErrorMessage}
              </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeactivate}
                disabled={isDeactivateSubmitting}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeactivateWallet}
                disabled={isDeactivateSubmitting}
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
              >
                {isDeactivateSubmitting
                  ? "Menonaktifkan..."
                  : "Ya, Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ACTIVATE MODAL
      ========================= */}
      {isActivateOpen && activatingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-xl font-bold">
              Aktifkan Kembali Wallet?
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Apakah kamu yakin ingin mengaktifkan kembali wallet{" "}
              <span className="font-semibold text-foreground">
                {activatingWallet.name}
              </span>
              ?
            </p>

            <p className="mt-3 text-sm text-muted-foreground">
              Saldo terakhir dan riwayat transaksi wallet akan tetap
              dipertahankan. Setelah diaktifkan, wallet akan kembali
              dihitung ke dalam Total Balance.
            </p>

            {activateErrorMessage && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {activateErrorMessage}
              </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseActivate}
                disabled={isActivateSubmitting}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleActivateWallet}
                disabled={isActivateSubmitting}
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
              >
                {isActivateSubmitting
                  ? "Mengaktifkan..."
                  : "Ya, Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}