"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowUpRight,
  Banknote,
  Check,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet as WalletIcon,
  X,
} from "lucide-react";

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

const getWalletIcon = (type: string) => {
  switch (type) {
    case "BANK":
      return Landmark;

    case "E_WALLET":
      return Smartphone;

    case "CASH":
      return Banknote;

    case "SAVINGS":
      return ShieldCheck;

    default:
      return WalletIcon;
  }
};

const getWalletIconContainer = (type: string) => {
  switch (type) {
    case "BANK":
      return "bg-primary/10 text-primary";

    case "E_WALLET":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400";

    case "CASH":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case "SAVINGS":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400";

    default:
      return "bg-muted text-muted-foreground";
  }
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
  const [activatingWallet, setActivatingWallet] =
    useState<Wallet | null>(null);

  const [activateErrorMessage, setActivateErrorMessage] = useState(
    ""
  );

  const [isActivateSubmitting, setIsActivateSubmitting] =
    useState(false);

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

  // =========================
  // DERIVED DATA
  // =========================

  const activeWallets = wallets.filter(
    (wallet) => wallet.isActive
  );

  const inactiveWallets = wallets.filter(
    (wallet) => !wallet.isActive
  );

  const totalActiveBalance = activeWallets.reduce(
    (total, wallet) => total + Number(wallet.balance),
    0
  );

  return (
    <>
      <div className="min-h-screen bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <WalletIcon className="h-4 w-4" />
                <span>Keuangan</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Wallet</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Wallet
              </h1>

              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                Kelola semua sumber uang yang kamu miliki dalam satu
                tempat.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Tambah Wallet
            </button>
          </div>

          {/* =========================
              BALANCE HERO
          ========================= */}

          <section className="relative mb-6 overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Balance
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Semua wallet aktif
                      </p>
                    </div>
                  </div>

                  <p className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {formatRupiah(totalBalance)}
                  </p>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                    Total saldo dari seluruh wallet yang sedang
                    aktif di SharkFin.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Saldo aktif
                    </p>

                    <p className="text-sm font-semibold">
                      {formatRupiah(String(totalActiveBalance))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================
              SUMMARY
          ========================= */}

          <section className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <WalletIcon className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Wallet Aktif
              </p>

              <p className="mt-1 text-2xl font-bold">
                {activeWallets.length}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Archive className="h-5 w-5" />
                </div>

                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Wallet Nonaktif
              </p>

              <p className="mt-1 text-2xl font-bold">
                {inactiveWallets.length}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>

                <span className="text-xs font-medium text-muted-foreground">
                  Semua sumber
                </span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Total Wallet
              </p>

              <p className="mt-1 text-2xl font-bold">
                {wallets.length}
              </p>
            </div>
          </section>

          {/* =========================
              ACTIVE WALLETS
          ========================= */}

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Wallet Aktif
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Sumber uang yang sedang digunakan.
                </p>
              </div>

              {activeWallets.length > 0 && (
                <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
                  {activeWallets.length} wallet
                </span>
              )}
            </div>

            {activeWallets.length === 0 ? (
              <div className="rounded-3xl border border-dashed bg-card p-8 text-center sm:p-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <WalletIcon className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  Belum ada wallet aktif
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Tambahkan wallet pertamamu seperti rekening
                  bank, e-wallet, cash, atau tabungan untuk mulai
                  mengelola saldo.
                </p>

                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Wallet
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeWallets.map((wallet) => {
                  const Icon = getWalletIcon(wallet.type);

                  return (
                    <div
                      key={wallet.id}
                      className="group rounded-3xl border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getWalletIconContainer(
                              wallet.type
                            )}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {wallet.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {walletTypeLabels[wallet.type] ??
                                wallet.type}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      </div>

                      <div className="mt-8">
                        <p className="text-xs font-medium text-muted-foreground">
                          Saldo
                        </p>

                        <p className="mt-1 break-all text-2xl font-bold tracking-tight">
                          {formatRupiah(wallet.balance)}
                        </p>
                      </div>

                      <div className="mt-6 flex gap-2 border-t pt-4">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(wallet)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border bg-background px-3 text-sm font-medium transition hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDeactivate(wallet)
                          }
                          className="inline-flex h-9 items-center justify-center rounded-xl border px-3 text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          title="Nonaktifkan wallet"
                          aria-label={`Nonaktifkan ${wallet.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* =========================
              INACTIVE WALLETS
          ========================= */}

          {inactiveWallets.length > 0 && (
            <section className="mt-10">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">
                    Wallet Nonaktif
                  </h2>

                  <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                    {inactiveWallets.length}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Wallet yang dinonaktifkan tetap tersimpan dan
                  dapat diaktifkan kembali kapan saja.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {inactiveWallets.map((wallet) => {
                  const Icon = getWalletIcon(wallet.type);

                  return (
                    <div
                      key={wallet.id}
                      className="rounded-3xl border border-red-200/70 bg-red-50/30 p-5 opacity-90 dark:border-red-900/60 dark:bg-red-950/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {wallet.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {walletTypeLabels[wallet.type] ??
                                wallet.type}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Nonaktif
                        </span>
                      </div>

                      <div className="mt-8">
                        <p className="text-xs font-medium text-muted-foreground">
                          Saldo terakhir
                        </p>

                        <p className="mt-1 break-all text-2xl font-bold tracking-tight text-muted-foreground">
                          {formatRupiah(wallet.balance)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenActivate(wallet)}
                        className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-background px-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Aktifkan Kembali
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* =====================================================
          ADD WALLET MODAL
      ===================================================== */}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-background p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-bold">
                  Tambah Wallet
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Tambahkan sumber uang baru ke SharkFin.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAdd}
                disabled={isSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addErrorMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <CircleDollarSign className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{addErrorMessage}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="wallet-name"
                  className="mb-2 block text-sm font-semibold"
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
                  className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label
                  htmlFor="wallet-type"
                  className="mb-2 block text-sm font-semibold"
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
                  className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                  className="mb-2 block text-sm font-semibold"
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
                  className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Masukkan angka saja, tanpa Rp atau titik.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCloseAdd}
                disabled={isSubmitting}
                className="h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleAddWallet}
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Wallet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT WALLET MODAL
      ===================================================== */}

      {isEditOpen && editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-background p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Pencil className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-bold">
                  Edit Wallet
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ubah informasi wallet kamu.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isEditSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editErrorMessage && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {editErrorMessage}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="edit-wallet-name"
                  className="mb-2 block text-sm font-semibold"
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
                  className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-wallet-type"
                  className="mb-2 block text-sm font-semibold"
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
                  className="h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                  htmlFor="edit-wallet-balance"
                  className="mb-2 block text-sm font-semibold"
                >
                  Saldo
                </label>

                <input
                  id="edit-wallet-balance"
                  type="text"
                  value={formatRupiah(editingWallet.balance)}
                  disabled
                  className="h-11 w-full rounded-xl border bg-muted px-3.5 text-sm text-muted-foreground"
                />

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Saldo tidak dapat diubah dari menu Edit.
                  Gunakan transaksi untuk mengubah saldo.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isEditSubmitting}
                className="h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleEditWallet}
                disabled={isEditSubmitting}
                className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEditSubmitting
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DEACTIVATE MODAL
      ===================================================== */}

      {isDeactivateOpen && deactivatingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl border bg-background p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
              <Archive className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Nonaktifkan Wallet?
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Apakah kamu yakin ingin menonaktifkan wallet{" "}
              <span className="font-semibold text-foreground">
                {deactivatingWallet.name}
              </span>
              ?
            </p>

            <div className="mt-4 rounded-2xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                Saldo terakhir
              </p>

              <p className="mt-1 font-semibold">
                {formatRupiah(deactivatingWallet.balance)}
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Wallet tidak akan dihapus dari database. Riwayat
              transaksi tetap aman dan wallet tidak akan digunakan
              sebagai wallet aktif.
            </p>

            {deactivateErrorMessage && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {deactivateErrorMessage}
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCloseDeactivate}
                disabled={isDeactivateSubmitting}
                className="h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeactivateWallet}
                disabled={isDeactivateSubmitting}
                className="h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeactivateSubmitting
                  ? "Menonaktifkan..."
                  : "Ya, Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ACTIVATE MODAL
      ===================================================== */}

      {isActivateOpen && activatingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl border bg-background p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <RotateCcw className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Aktifkan Kembali Wallet?
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Apakah kamu yakin ingin mengaktifkan kembali wallet{" "}
              <span className="font-semibold text-foreground">
                {activatingWallet.name}
              </span>
              ?
            </p>

            <div className="mt-4 rounded-2xl bg-emerald-500/5 p-4">
              <p className="text-xs text-muted-foreground">
                Saldo terakhir
              </p>

              <p className="mt-1 font-semibold">
                {formatRupiah(activatingWallet.balance)}
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Saldo terakhir dan riwayat transaksi wallet akan tetap
              dipertahankan. Setelah diaktifkan, wallet akan kembali
              dihitung ke dalam Total Balance.
            </p>

            {activateErrorMessage && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {activateErrorMessage}
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCloseActivate}
                disabled={isActivateSubmitting}
                className="h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleActivateWallet}
                disabled={isActivateSubmitting}
                className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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