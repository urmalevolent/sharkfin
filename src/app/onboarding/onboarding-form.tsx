"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = 1 | 2 | 3;

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

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
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Langkah {step} dari 3
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${(step / 3) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border p-6 shadow-sm">
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold">
                Siapa nama kamu?
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Nama ini akan digunakan SharkFin untuk menyapamu.
              </p>

              <div className="mt-6">
                <Label htmlFor="name">
                  Nama
                </Label>

                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Rizqi"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold">
                Ceritakan tentang pemasukanmu
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Data ini membantu SharkFin memahami kondisi keuanganmu.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <Label htmlFor="incomeAmount">
                    Jumlah pemasukan
                  </Label>

                  <Input
                    id="incomeAmount"
                    type="number"
                    min="0"
                    value={incomeAmount}
                    onChange={(event) =>
                      setIncomeAmount(event.target.value)
                    }
                    placeholder="Contoh: 3000000"
                    className="mt-2"
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    Masukkan angka tanpa titik atau simbol Rp.
                  </p>
                </div>

                <div>
                  <Label htmlFor="incomeFrequency">
                    Frekuensi pemasukan
                  </Label>

                  <select
                    id="incomeFrequency"
                    value={incomeFrequency}
                    onChange={(event) =>
                      setIncomeFrequency(event.target.value)
                    }
                    className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">
                      Pilih frekuensi
                    </option>

                    <option value="MONTHLY">
                      Bulanan
                    </option>

                    <option value="WEEKLY">
                      Mingguan
                    </option>

                    <option value="IRREGULAR">
                      Tidak tetap
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-2xl font-bold">
                Buat wallet pertamamu
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Tambahkan tempat pertama kamu menyimpan uang.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <Label htmlFor="walletName">
                    Nama wallet
                  </Label>

                  <Input
                    id="walletName"
                    value={walletName}
                    onChange={(event) =>
                      setWalletName(event.target.value)
                    }
                    placeholder="Contoh: BCA, GoPay, Cash"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="walletType">
                    Tipe wallet
                  </Label>

                  <select
                    id="walletType"
                    value={walletType}
                    onChange={(event) =>
                      setWalletType(event.target.value)
                    }
                    className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">
                      Pilih tipe wallet
                    </option>

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="BANK">
                      Bank
                    </option>

                    <option value="E_WALLET">
                      E-Wallet
                    </option>

                    <option value="SAVINGS">
                      Tabungan
                    </option>

                    <option value="OTHER">
                      Lainnya
                    </option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="walletBalance">
                    Saldo saat ini
                  </Label>

                  <Input
                    id="walletBalance"
                    type="number"
                    min="0"
                    value={walletBalance}
                    onChange={(event) =>
                      setWalletBalance(event.target.value)
                    }
                    placeholder="Contoh: 2500000"
                    className="mt-2"
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    Masukkan saldo yang benar-benar kamu miliki saat ini.
                  </p>
                </div>
              </div>
            </form>
          )}

          {error && (
            <p className="mt-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={loading}
              >
                Kembali
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
              >
                Lanjut
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : "Selesai"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}