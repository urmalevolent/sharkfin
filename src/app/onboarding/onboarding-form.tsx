"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = 1 | 2 | 3;

const steps = [
  {
    number: 1,
    title: "Informasi",
  },
  {
    number: 2,
    title: "Pemasukan",
  },
  {
    number: 3,
    title: "Wallet",
  },
];

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.1-5.2 7-5.2s6.2 1.8 7 5.2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M4 8h13" />
      <path d="M16 11h3v3h-3a1.5 1.5 0 0 1 0-3Z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 10h.01M17 14h.01" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="m11 6-6 6 6 6" />
      <path d="M5 12h14" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="m4 15 5-5 4 3 7-7" />
      <path d="M15 6h5v5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function OnboardingForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeFrequency, setIncomeFrequency] = useState("");

  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState("");
  const [walletBalance, setWalletBalance] = useState("");

  const nextStep = () => {
    setError("");

    if (step === 1 && !name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (step === 2) {
      if (!incomeAmount) {
        setError("Jumlah pemasukan wajib diisi.");
        return;
      }

      if (Number(incomeAmount) < 0) {
        setError("Jumlah pemasukan tidak boleh negatif.");
        return;
      }

      if (!incomeFrequency) {
        setError("Pilih frekuensi pemasukan.");
        return;
      }
    }

    setStep((current) => (current + 1) as Step);
  };

  const previousStep = () => {
    setError("");
    setStep((current) => (current - 1) as Step);
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    setError("");

    if (!walletName.trim()) {
      setError("Nama wallet wajib diisi.");
      return;
    }

    if (!walletType) {
      setError("Pilih tipe wallet.");
      return;
    }

    if (!walletBalance) {
      setError("Saldo awal wajib diisi.");
      return;
    }

    if (Number(walletBalance) < 0) {
      setError("Saldo awal tidak boleh negatif.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          incomeAmount,
          incomeFrequency,
          walletName,
          walletType,
          walletBalance,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Gagal menyelesaikan onboarding.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white lg:flex">
      {/* =========================================================
          LEFT BRAND PANEL
      ========================================================= */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#07152f] text-white lg:flex lg:w-[45%]">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Decorative financial curves */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg
            viewBox="0 0 700 1000"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full opacity-40"
          >
            <path
              d="M-100 570 C100 500 170 610 310 580 C440 550 490 450 730 330"
              fill="none"
              stroke="#168cff"
              strokeWidth="2"
              strokeDasharray="8 9"
            />

            <path
              d="M-100 760 C80 680 170 810 330 750 C490 690 540 600 750 520"
              fill="none"
              stroke="#1674dc"
              strokeWidth="2"
            />

            <path
              d="M-100 870 C100 800 220 900 380 830 C510 775 590 700 750 650"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="relative z-10 flex min-h-screen w-full flex-col px-10 py-12 xl:px-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] shadow-lg">
              <div className="text-xl font-black text-cyan-400">Λ</div>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">
                SharkFin
              </h2>

              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.28em] text-cyan-400">
                CAPITAL ENGINE
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="my-auto max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-slate-200">
              <TrendIcon />
              <span>Setup Akun Personalisasi</span>
            </div>

            <h1 className="text-5xl font-black leading-[1.03] tracking-tight xl:text-6xl">
              Siapkan SharkFin
              <br />
              <span className="text-cyan-300">untukmu.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-slate-300 xl:text-lg">
              Berikan sedikit informasi agar SharkFin dapat
              memahami kondisi keuanganmu dengan lebih baik.
            </p>

            {/* AI Card */}
            <div className="mt-10 max-w-xl rounded-2xl border border-cyan-400/30 bg-[#0d1d40]/80 p-6 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                </div>

                <p className="text-sm font-bold tracking-wide text-cyan-300">
                  AI-POWERED FINANCE
                </p>
              </div>

              <p className="mt-4 text-base font-medium text-white">
                Kenali kondisi keuanganmu.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Rencanakan langkah berikutnya dengan presisi
                otomatis.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400">
            <span>© 2026 SharkFin Platform</span>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span>Sistem Aktif &amp; Terlindungi</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          RIGHT FORM PANEL
      ========================================================= */}
      <section className="flex min-h-screen flex-1 flex-col bg-white px-6 py-8 sm:px-10 lg:px-12 xl:px-20">
        {/* Progress */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center">
            {steps.map((item, index) => {
              const active = step === item.number;
              const completed = step > item.number;

              return (
                <div
                  key={item.number}
                  className="flex flex-1 items-center"
                >
                  <div
                    className={`flex items-center gap-2 transition-all duration-500 ${
                      active || completed
                        ? "text-[#0b1228]"
                        : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-500 ${
                        active
                          ? "border-[#0b1228] bg-[#0b1228] text-white shadow-lg"
                          : completed
                            ? "border-[#168cff] bg-[#168cff] text-white"
                            : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {item.number}
                    </div>

                    <span className="hidden text-sm font-medium sm:block">
                      0{item.number} {item.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="mx-3 h-px flex-1 bg-slate-200">
                      <div
                        className={`h-full transition-all duration-700 ${
                          step > item.number
                            ? "w-full bg-[#168cff]"
                            : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress underline */}
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-[#0b1228] transition-all duration-700 ease-out"
              style={{
                width: `${(step / 3) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10">
          <div
            key={step}
            className="animate-in fade-in slide-in-from-right-4 duration-500"
          >
            {/* =====================================================
                STEP 1
            ===================================================== */}
            {step === 1 && (
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-[#168cff]">
                  LANGKAH 1 DARI 3
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1228] sm:text-4xl">
                  Kenalan dulu dengan SharkFin
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                  Siapa nama kamu? Informasi ini akan digunakan
                  untuk membuat pengalaman SharkFin terasa lebih
                  personal.
                </p>

                <div className="mt-10">
                  <Label
                    htmlFor="name"
                    className="text-xs font-bold uppercase tracking-wide text-slate-700"
                  >
                    Nama
                  </Label>

                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <UserIcon />
                    </div>

                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Nama lengkap"
                      autoFocus
                      className="h-14 rounded-xl border-slate-200 bg-slate-50 pl-12 text-base shadow-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#168cff] focus:bg-white focus:ring-4 focus:ring-[#168cff]/10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={nextStep}
                  className="mt-10 h-14 w-full rounded-xl bg-[#0b1228] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#111b38] hover:shadow-xl"
                >
                  Lanjut
                  <ArrowRightIcon />
                </Button>
              </div>
            )}

            {/* =====================================================
                STEP 2
            ===================================================== */}
            {step === 2 && (
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-[#168cff]">
                  LANGKAH 2 DARI 3
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1228] sm:text-4xl">
                  Berapa pemasukanmu?
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                  Informasi ini membantu SharkFin memahami kondisi
                  cashflow dan memberikan analisis yang lebih
                  relevan.
                </p>

                <div className="mt-10 space-y-7">
                  {/* Income amount */}
                  <div>
                    <Label
                      htmlFor="incomeAmount"
                      className="text-xs font-bold uppercase tracking-wide text-slate-700"
                    >
                      Jumlah Pemasukan
                    </Label>

                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <MoneyIcon />
                      </div>

                      <Input
                        id="incomeAmount"
                        type="number"
                        min="0"
                        value={incomeAmount}
                        onChange={(event) =>
                          setIncomeAmount(event.target.value)
                        }
                        placeholder="Contoh: 900000"
                        autoFocus
                        className="h-14 rounded-xl border-slate-200 bg-slate-50 pl-12 text-base shadow-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#168cff] focus:bg-white focus:ring-4 focus:ring-[#168cff]/10"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Masukkan angka tanpa titik atau simbol Rp.
                    </p>
                  </div>

                  {/* Frequency */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      Frekuensi Pemasukan
                    </Label>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        {
                          value: "MONTHLY",
                          label: "Bulanan",
                        },
                        {
                          value: "WEEKLY",
                          label: "Mingguan",
                        },
                        {
                          value: "IRREGULAR",
                          label: "Tidak tetap",
                        },
                      ].map((option) => {
                        const selected =
                          incomeFrequency === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setIncomeFrequency(option.value)
                            }
                            className={`h-12 rounded-xl border text-sm font-medium transition-all duration-300 ${
                              selected
                                ? "border-[#168cff] bg-[#168cff]/10 text-[#0b65bd] shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#168cff]/40 hover:bg-white"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-10 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={previousStep}
                    disabled={loading}
                    className="h-14 flex-1 rounded-xl border-slate-200 text-slate-700 transition-all duration-300 hover:bg-slate-50"
                  >
                    <ArrowLeftIcon />
                    Kembali
                  </Button>

                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={loading}
                    className="h-14 flex-[2] rounded-xl bg-[#0b1228] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#111b38] hover:shadow-xl"
                  >
                    Lanjut
                    <ArrowRightIcon />
                  </Button>
                </div>
              </div>
            )}

            {/* =====================================================
                STEP 3
            ===================================================== */}
            {step === 3 && (
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-[#168cff]">
                  LANGKAH 3 DARI 3
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1228] sm:text-4xl">
                  Di mana uangmu disimpan?
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                  Buat wallet pertamamu agar SharkFin dapat
                  menghitung total saldo yang kamu miliki.
                </p>

                <div className="mt-10 space-y-7">
                  {/* Wallet name */}
                  <div>
                    <Label
                      htmlFor="walletName"
                      className="text-xs font-bold uppercase tracking-wide text-slate-700"
                    >
                      Nama Wallet
                    </Label>

                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <WalletIcon />
                      </div>

                      <Input
                        id="walletName"
                        type="text"
                        value={walletName}
                        onChange={(event) =>
                          setWalletName(event.target.value)
                        }
                        placeholder="Contoh: BCA"
                        autoFocus
                        className="h-14 rounded-xl border-slate-200 bg-slate-50 pl-12 text-base shadow-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#168cff] focus:bg-white focus:ring-4 focus:ring-[#168cff]/10"
                      />
                    </div>
                  </div>

                  {/* Wallet type */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      Tipe Wallet
                    </Label>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {[
                        {
                          value: "CASH",
                          label: "Cash",
                        },
                        {
                          value: "BANK",
                          label: "Bank",
                        },
                        {
                          value: "E_WALLET",
                          label: "E-Wallet",
                        },
                        {
                          value: "SAVINGS",
                          label: "Tabungan",
                        },
                        {
                          value: "OTHER",
                          label: "Lainnya",
                        },
                      ].map((option) => {
                        const selected =
                          walletType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setWalletType(option.value)
                            }
                            className={`h-11 rounded-xl border px-2 text-xs font-medium transition-all duration-300 ${
                              selected
                                ? "border-[#168cff] bg-[#168cff]/10 text-[#0b65bd]"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#168cff]/40 hover:bg-white"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Balance */}
                  <div>
                    <Label
                      htmlFor="walletBalance"
                      className="text-xs font-bold uppercase tracking-wide text-slate-700"
                    >
                      Saldo Saat Ini
                    </Label>

                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <MoneyIcon />
                      </div>

                      <Input
                        id="walletBalance"
                        type="number"
                        min="0"
                        value={walletBalance}
                        onChange={(event) =>
                          setWalletBalance(event.target.value)
                        }
                        placeholder="Contoh: 900000"
                        className="h-14 rounded-xl border-slate-200 bg-slate-50 pl-12 text-base shadow-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#168cff] focus:bg-white focus:ring-4 focus:ring-[#168cff]/10"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Masukkan saldo yang benar-benar kamu miliki
                      saat ini.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-10 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={previousStep}
                    disabled={loading}
                    className="h-14 flex-1 rounded-xl border-slate-200 text-slate-700 transition-all duration-300 hover:bg-slate-50"
                  >
                    <ArrowLeftIcon />
                    Kembali
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="h-14 flex-[2] rounded-xl bg-[#0b1228] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#111b38] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Menyimpan..." : "Mulai dengan SharkFin"}
                    {!loading && <ArrowRightIcon />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">
              <LockIcon />
            </span>

            <span>Privasi &amp; data finansialmu terenkripsi</span>
          </div>

          <span className="hidden sm:block">
            Tahap {step} · Setup Dasar
          </span>
        </div>
      </section>
    </main>
  );
}