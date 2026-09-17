"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

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

        <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#38BDF8]">
          Capital Engine
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 19C6.1 15.9 8.3 14 12 14C15.7 14 17.9 15.9 18.5 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
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
      <circle
        cx="12"
        cy="15"
        r="1.1"
        fill="currentColor"
      />
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
          d="M10.6 10.6C10.24 10.96 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.04 13.76 13.4 13.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M3 3L21 21"
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

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registrasi gagal.");
        return;
      }

      router.push("/login?registered=true");
    } catch (error) {
      console.error("Register error:", error);
      setError(
        "Terjadi kesalahan. Silakan coba lagi."
      );
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

        .register-brand {
          animation: fadeIn 0.8s ease-out both;
        }

        .register-content {
          animation: fadeUp 0.7s ease-out both;
        }

        .register-stagger-1 {
          animation: fadeUp 0.6s 0.1s ease-out both;
        }

        .register-stagger-2 {
          animation: fadeUp 0.6s 0.16s ease-out both;
        }

        .register-stagger-3 {
          animation: fadeUp 0.6s 0.22s ease-out both;
        }

        .register-stagger-4 {
          animation: fadeUp 0.6s 0.28s ease-out both;
        }

        .register-stagger-5 {
          animation: fadeUp 0.6s 0.34s ease-out both;
        }

        .register-stagger-6 {
          animation: fadeUp 0.6s 0.4s ease-out both;
        }

        .floating-line {
          animation: floatLine 7s ease-in-out infinite;
        }

        .floating-line-delayed {
          animation: floatLine 9s 1s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .register-brand,
          .register-content,
          .register-stagger-1,
          .register-stagger-2,
          .register-stagger-3,
          .register-stagger-4,
          .register-stagger-5,
          .register-stagger-6,
          .floating-line,
          .floating-line-delayed {
            animation: none;
          }
        }
      `}</style>

      <main className="min-h-screen bg-white font-[Arial,_Helvetica,_sans-serif] text-[#111827]">
        <div className="flex min-h-screen flex-col lg:flex-row">
          {/* LEFT BRAND PANEL */}
          <section className="register-brand relative min-h-[650px] w-full overflow-hidden bg-[#07142c] lg:min-h-screen lg:w-[45%]">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #94a3b8 1px, transparent 1px),
                  linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
                `,
                backgroundSize: "62px 62px",
              }}
            />

            {/* Subtle blue glow */}
            <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-blue-600/[0.07] blur-3xl" />

            {/* Financial lines */}
            <svg
              className="pointer-events-none absolute bottom-[12%] left-0 h-[320px] w-full opacity-70"
              viewBox="0 0 700 320"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="floating-line"
                d="M-20 250C75 200 120 228 190 235C270 242 280 175 365 195C445 214 480 245 555 200C605 171 650 154 730 139"
                stroke="#1b4677"
                strokeWidth="2"
              />

              <path
                className="floating-line-delayed"
                d="M-20 220C85 155 130 197 215 207C295 216 315 137 390 156C470 176 510 219 585 173C640 140 670 124 730 108"
                stroke="#14538c"
                strokeWidth="1.5"
              />

              <path
                d="M-20 195C80 130 130 175 215 184C295 193 315 110 395 131C470 150 515 195 590 147C640 115 675 97 730 83"
                stroke="#12355f"
                strokeWidth="1"
              />
            </svg>

            {/* Brand content */}
            <div className="relative z-10 flex min-h-[650px] flex-col px-7 py-7 sm:px-10 sm:py-10 lg:min-h-screen lg:px-[11%] lg:py-12">
              <SharkFinLogo />

              <div className="my-auto max-w-[540px] py-14 lg:py-20">
                {/* Badge */}
                <div className="register-stagger-1 mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#0d203d]/80 px-4 py-2 text-[12px] font-medium tracking-wide text-slate-300">
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

                  Presisi Analisis Finansial
                </div>

                {/* Heading */}
                <h2 className="register-stagger-2 max-w-[530px] text-[45px] font-bold leading-[1.03] tracking-[-0.045em] text-white sm:text-[53px]">
                  Mulai perjalananmu.
                  <br />
                  <span className="text-[#67d4ff]">
                    Kelola lebih tajam.
                  </span>
                </h2>

                {/* Description */}
                <p className="register-stagger-3 mt-7 max-w-[520px] text-[16px] leading-7 text-slate-300 sm:text-[17px]">
                  Bangun kebiasaan finansial yang lebih
                  baik, pahami pengeluaranmu, dan buat
                  keputusan dengan lebih percaya diri
                  bersama SharkFin.
                </p>

                {/* AI Card */}
                <div className="register-stagger-4 mt-9 max-w-[520px] rounded-2xl border border-blue-400/30 bg-[#0d2142]/90 px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
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
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#67d4ff]">
                        AI-POWERED FINANCE
                      </div>

                      <div className="mt-1 text-[18px] font-semibold leading-6 tracking-[-0.02em] text-white">
                        Kenali pola keuanganmu.
                        <br className="hidden sm:block" />
                        Rencanakan langkah berikutnya.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="register-stagger-5 flex items-center justify-between border-t border-white/[0.06] pt-5 text-[12px] text-slate-400">
                <span>
                  © {new Date().getFullYear()} SharkFin Platform
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Sistem Aktif & Terlindungi
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT REGISTER PANEL */}
          <section className="relative flex min-h-[700px] w-full items-center justify-center overflow-hidden bg-white px-6 py-12 sm:px-10 lg:min-h-screen lg:w-[55%] lg:px-12">
            <div className="register-content w-full max-w-[480px]">
              {/* Heading */}
              <div className="register-stagger-1">
                <div className="text-[12px] font-semibold uppercase tracking-[0.13em] text-[#1684d8]">
                  PERSONAL FINANCE, MADE SIMPLE
                </div>

                <h1 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.045em] text-[#111827] sm:text-[38px]">
                  Buat akun SharkFin
                </h1>

                <p className="mt-3 max-w-[470px] text-[16px] leading-6 text-[#718096]">
                  Mulai kelola keuanganmu dengan lebih
                  sederhana dan terarah.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-8"
              >
                {/* Name */}
                <div className="register-stagger-2">
                  <label
                    htmlFor="name"
                    className="mb-3 block text-[12px] font-bold uppercase tracking-[0.05em] text-[#334155]"
                  >
                    Nama
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8da3c2] transition-colors duration-200 group-focus-within:text-[#1684d8]">
                      <UserIcon />
                    </div>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Nama lengkap"
                      required
                      autoComplete="name"
                      className="h-[54px] w-full rounded-xl border border-[#dbe4ef] bg-[#f4f7fb] pl-12 pr-4 text-[15px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[#8da3c2] hover:border-[#c9d6e5] focus:border-[#1684d8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,132,216,0.07)]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="register-stagger-3 mt-5">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-[12px] font-bold uppercase tracking-[0.05em] text-[#334155]"
                  >
                    Email
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8da3c2] transition-colors duration-200 group-focus-within:text-[#1684d8]">
                      <MailIcon />
                    </div>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="nama@email.com"
                      required
                      autoComplete="email"
                      className="h-[54px] w-full rounded-xl border border-[#dbe4ef] bg-[#f4f7fb] pl-12 pr-4 text-[15px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[#8da3c2] hover:border-[#c9d6e5] focus:border-[#1684d8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,132,216,0.07)]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="register-stagger-4 mt-5">
                  <label
                    htmlFor="password"
                    className="mb-3 block text-[12px] font-bold uppercase tracking-[0.05em] text-[#334155]"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8da3c2] transition-colors duration-200 group-focus-within:text-[#1684d8]">
                      <LockIcon />
                    </div>

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Masukkan password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-[54px] w-full rounded-xl border border-[#dbe4ef] bg-[#f4f7fb] pl-12 pr-12 text-[15px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[#8da3c2] hover:border-[#c9d6e5] focus:border-[#1684d8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,132,216,0.07)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8da3c2] transition-colors duration-200 hover:text-[#334155]"
                    >
                      <EyeIcon
                        visible={showPassword}
                      />
                    </button>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#7b8da8]">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#9db0ca] text-[9px]">
                      i
                    </span>
                    Gunakan minimal 6 karakter.
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="register-stagger-5 mt-5">
                  <label
                    htmlFor="confirmPassword"
                    className="mb-3 block text-[12px] font-bold uppercase tracking-[0.05em] text-[#334155]"
                  >
                    Konfirmasi Password
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8da3c2] transition-colors duration-200 group-focus-within:text-[#1684d8]">
                      <LockIcon />
                    </div>

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Ulangi password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-[54px] w-full rounded-xl border border-[#dbe4ef] bg-[#f4f7fb] pl-12 pr-12 text-[15px] text-[#111827] outline-none transition-all duration-200 placeholder:text-[#8da3c2] hover:border-[#c9d6e5] focus:border-[#1684d8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,132,216,0.07)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8da3c2] transition-colors duration-200 hover:text-[#334155]"
                    >
                      <EyeIcon
                        visible={showConfirmPassword}
                      />
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm leading-5 text-red-500">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div className="register-stagger-6 mt-7">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-[#0d1428] px-5 text-[16px] font-bold text-white shadow-[0_5px_12px_rgba(13,20,40,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#141d36] hover:shadow-[0_9px_20px_rgba(13,20,40,0.2)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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

                        Membuat akun...
                      </>
                    ) : (
                      <>
                        Buat Akun

                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          <ArrowRight />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Login */}
              <div className="register-stagger-6 mt-8 text-center text-[14px] text-[#64748b]">
                Sudah memiliki akun SharkFin?{" "}
                <a
                  href="/login"
                  className="font-semibold text-[#1684d8] transition-colors duration-200 hover:text-[#1269ac]"
                >
                  Masuk
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}