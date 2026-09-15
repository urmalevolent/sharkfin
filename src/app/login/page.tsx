"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function SharkFinLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#182743] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        <div className="absolute inset-[5px] rounded-lg border border-blue-400/10" />

        <svg
          viewBox="0 0 40 40"
          className="relative h-8 w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 29.5C14.8 23.7 18.5 17.6 24.5 9.5C25.2 14.4 27.2 18.1 31 21.3C25.2 22.3 20.8 25.3 17.1 30.1L11 29.5Z"
            fill="url(#logoGradient)"
          />
          <path
            d="M17.1 30.1C19.7 26.4 22.6 23.9 26.5 22.2"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="logoGradient"
              x1="11"
              y1="30"
              x2="31"
              y2="10"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div>
        <div className="text-[18px] font-bold leading-none tracking-[-0.03em] text-white">
          SharkFin
        </div>
        <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Capital Engine
        </div>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4 7L12 13L20 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 10V7.5C8 5.57 9.57 4 11.5 4H12.5C14.43 4 16 5.57 16 7.5V10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.1" fill="currentColor" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3L21 21"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M10.6 10.6C10.24 10.96 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.04 13.76 13.4 13.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M9.88 5.1C10.56 4.91 11.27 4.82 12 4.82C16.92 4.82 20.5 8.53 21.5 12C21.12 13.32 20.35 14.71 19.24 15.88"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M6.61 6.61C4.79 7.91 3.5 9.82 2.5 12C3.5 15.47 7.08 19.18 12 19.18C13.36 19.18 14.63 18.92 15.78 18.44"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 12C3.5 8.53 7.08 4.82 12 4.82C16.92 4.82 20.5 8.53 21.5 12C20.5 15.47 16.92 19.18 12 19.18C7.08 19.18 3.5 15.47 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Email atau password salah.");
        return;
      }

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

      if (onboardingData.onboardingCompleted) {
        router.push("/dashboard");
      } else {
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
    <>
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes floatLine {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        .login-brand {
          animation: fadeIn 0.8s ease-out both;
        }

        .login-content {
          animation: fadeUp 0.7s ease-out both;
        }

        .login-stagger-1 {
          animation: fadeUp 0.6s 0.1s ease-out both;
        }

        .login-stagger-2 {
          animation: fadeUp 0.6s 0.18s ease-out both;
        }

        .login-stagger-3 {
          animation: fadeUp 0.6s 0.26s ease-out both;
        }

        .login-stagger-4 {
          animation: fadeUp 0.6s 0.34s ease-out both;
        }

        .login-stagger-5 {
          animation: fadeUp 0.6s 0.42s ease-out both;
        }

        .floating-line {
          animation: floatLine 7s ease-in-out infinite;
        }

        .floating-line-delayed {
          animation: floatLine 9s 1s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .login-brand,
          .login-content,
          .login-stagger-1,
          .login-stagger-2,
          .login-stagger-3,
          .login-stagger-4,
          .login-stagger-5,
          .floating-line,
          .floating-line-delayed {
            animation: none;
          }
        }
      `}</style>

      <main className="min-h-screen bg-white font-[Arial,_Helvetica,_sans-serif] text-[#111827]">
        <div className="flex min-h-screen flex-col lg:flex-row">
          {/* LEFT BRAND PANEL */}
          <section className="login-brand relative min-h-[560px] w-full overflow-hidden bg-[#101b31] lg:min-h-screen lg:w-[45%]">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.075]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #94a3b8 1px, transparent 1px),
                  linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
                `,
                backgroundSize: "62px 62px",
              }}
            />

            {/* Subtle radial light */}
            <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-blue-600/[0.07] blur-3xl" />

            {/* Abstract financial lines */}
            <svg
              className="pointer-events-none absolute bottom-[15%] left-0 h-[300px] w-full opacity-60"
              viewBox="0 0 700 300"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="floating-line"
                d="M-20 245C75 195 120 225 190 230C270 236 280 170 365 190C445 209 480 240 555 196C605 167 650 150 730 135"
                stroke="#19325d"
                strokeWidth="2"
              />
              <path
                className="floating-line-delayed"
                d="M-20 215C85 150 130 192 215 202C295 211 315 132 390 151C470 171 510 214 585 168C640 135 670 119 730 103"
                stroke="#234477"
                strokeWidth="1.5"
              />
              <path
                d="M-20 190C80 125 130 170 215 179C295 188 315 105 395 126C470 145 515 190 590 142C640 110 675 92 730 78"
                stroke="#172c4f"
                strokeWidth="1"
              />
            </svg>

            {/* Brand content */}
            <div className="relative z-10 flex min-h-[560px] flex-col px-7 py-7 sm:px-10 sm:py-10 lg:min-h-screen lg:px-[8%] lg:py-12">
              <SharkFinLogo />

              <div className="my-auto max-w-[570px] py-16 lg:py-20">
                {/* Small label */}
                <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#1b2942]/90 px-4 py-2 text-[12px] font-semibold tracking-wide text-slate-300 shadow-[0_8px_25px_rgba(0,0,0,0.12)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 17L8 13L11 16L18 8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 8H18V11"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Presisi Analisis Portofolio
                </div>

                {/* Main heading */}
                <h2 className="max-w-[560px] text-[44px] font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-[54px] lg:text-[56px]">
                  Keuanganmu.
                  <br />
                  <span className="text-[#cbd5ff]">
                    Lebih tajam.
                  </span>
                </h2>

                <p className="mt-7 max-w-[555px] text-[16px] leading-7 text-slate-400 sm:text-[17px]">
                  Kelola aset, identifikasi asimetri pasar, dan eksekusi
                  strategi finansial tingkat institusi didukung AI
                  prediktif SharkFin.
                </p>

                {/* AI card */}
                <div className="mt-9 max-w-[520px] rounded-2xl border border-white/[0.05] bg-[#1d2940]/90 px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 3V6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 18V21"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 12H6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 12H21"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M5.64 5.64L7.76 7.76"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16.24 16.24L18.36 18.36"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18.36 5.64L16.24 7.76"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.76 16.24L5.64 18.36"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                        AI-POWERED FINANCE
                      </div>
                      <div className="mt-1 text-[19px] font-bold leading-6 tracking-[-0.02em] text-white">
                        Pahami uangmu. Ambil keputusan
                        <br className="hidden sm:block" />
                        dengan lebih tajam.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT LOGIN PANEL */}
          <section className="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden bg-white px-6 py-12 sm:px-10 lg:min-h-screen lg:w-[55%] lg:px-12">
            <div className="login-content w-full max-w-[475px]">
              {/* Heading */}
              <div className="login-stagger-1">
                <div className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#2563eb]">
                  PERSONAL FINANCE, MADE SIMPLE
                </div>

                <h1 className="mt-3 text-[38px] font-bold leading-[1.08] tracking-[-0.045em] text-[#111827] sm:text-[42px]">
                  Selamat datang kembali
                </h1>

                <p className="mt-3 max-w-[470px] text-[15px] leading-6 text-[#4b5563] sm:text-[16px]">
                  Masuk ke SharkFin dan lanjutkan optimalisasi portofolio
                  finansial Anda.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-9"
              >
                {/* Success */}
                {success && (
                  <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-600">
                    {success}
                  </div>
                )}

                {/* Email */}
                <div className="login-stagger-2">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-[12px] font-bold uppercase tracking-[0.05em] text-[#1f2937]"
                  >
                    Email
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#2563eb]">
                      <MailIcon />
                    </div>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="nama@perusahaan.com"
                      required
                      autoComplete="email"
                      className="h-[54px] w-full rounded-xl border border-[#f0f2f5] bg-[#f8faff] pl-12 pr-4 text-[15px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[#a5aab3] hover:border-[#e5e9ef] focus:border-[#2563eb] focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.07)]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="login-stagger-3 mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#1f2937]"
                    >
                      Password
                    </label>

                    <a
                      href="#"
                      onClick={(event) => event.preventDefault()}
                      className="text-[12px] font-semibold text-[#2563eb] transition-colors duration-200 hover:text-[#1d4ed8]"
                    >
                      Lupa kata sandi?
                    </a>
                  </div>

                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#2563eb]">
                      <LockIcon />
                    </div>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Masukkan password"
                      required
                      autoComplete="current-password"
                      className="h-[54px] w-full rounded-xl border border-[#f0f2f5] bg-[#f8faff] pl-12 pr-12 text-[15px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[#a5aab3] hover:border-[#e5e9ef] focus:border-[#2563eb] focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.07)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 hover:text-[#374151]"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div className="login-stagger-4 mt-7">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-[#111a2e] px-5 text-[18px] font-bold text-white shadow-[0_5px_12px_rgba(17,24,39,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#16213a] hover:shadow-[0_9px_20px_rgba(17,24,39,0.2)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeOpacity="0.3"
                            strokeWidth="3"
                          />
                          <path
                            d="M21 12C21 7.02944 16.9706 3 12 3"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk ke Dashboard
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          <ArrowRight />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Register */}
              <div className="login-stagger-5 mt-9 text-center text-[14px] text-[#4b5563]">
                Belum memiliki akun SharkFin?{" "}
                <a
                  href="/register"
                  className="font-semibold text-[#2563eb] transition-colors duration-200 hover:text-[#1d4ed8]"
                >
                  Daftar
                  <span className="ml-1 inline-block transition-transform duration-200 hover:translate-x-0.5">
                    ›
                  </span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white px-6 font-[Arial,_Helvetica,_sans-serif]">
          <div className="text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#dbe4f5] border-t-[#2563eb]" />
            <p className="mt-3 text-sm text-[#6b7280]">
              Memuat halaman login...
            </p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}