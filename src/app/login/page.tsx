"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Akun berhasil dibuat. Silakan login.");
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Login menggunakan Auth.js
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // Login gagal
      if (!result?.ok) {
        setError("Email atau password salah.");
        return;
      }

      // Cek apakah user sudah menyelesaikan onboarding
      const onboardingResponse = await fetch(
        "/api/onboarding/status",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const onboardingData = await onboardingResponse.json();

      if (!onboardingResponse.ok) {
        setError(
          onboardingData.message ??
            "Gagal mengecek status onboarding."
        );
        return;
      }

      // User sudah selesai onboarding
      if (onboardingData.onboardingCompleted) {
        router.push("/dashboard");
      } else {
        // User belum selesai onboarding
        router.push("/onboarding");
      }

      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Login ke SharkFin
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Kelola keuanganmu dengan lebih cerdas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Success */}
          {success && (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-medium text-foreground underline"
          >
            Daftar
          </a>
        </p>
      </div>
    </main>
  );
}