import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFinancialOverview } from "@/services/financial-engine.service";
import { getUserInsights } from "@/services/insight.service";
import { prisma } from "@/lib/prisma";

function formatRupiah(value: string | number | bigint) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatCompactRupiah(value: string | number | bigint) {
  const number = Number(value);

  if (number >= 1_000_000_000) {
    return `Rp${(number / 1_000_000_000).toFixed(1)} M`;
  }

  if (number >= 1_000_000) {
    return `Rp${(number / 1_000_000).toFixed(2)} Jt`;
  }

  if (number >= 1_000) {
    return `Rp${Math.round(number / 1_000)} Rb`;
  }

  return formatRupiah(number).replace(",00", "");
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";

  return "Selamat malam";
}

function getHealthLabel(status: string) {
  switch (status) {
    case "GOOD":
      return "Sehat";

    case "WATCH":
      return "Perlu diperhatikan";

    case "WARNING":
      return "Perlu perhatian";

    default:
      return "Belum tersedia";
  }
}

function getHealthDescription(status: string) {
  switch (status) {
    case "GOOD":
      return "Indikator keuanganmu saat ini berada dalam kondisi baik.";

    case "WATCH":
      return "Ada beberapa indikator yang sebaiknya kamu perhatikan.";

    case "WARNING":
      return "Ada kondisi keuangan yang membutuhkan perhatian lebih.";

    default:
      return "Belum cukup data untuk membaca kondisi keuanganmu.";
  }
}

function getInsightLabel(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "Perlu tindakan";

    case "WARNING":
      return "Perlu diperhatikan";

    case "INFO":
      return "Informasi";

    default:
      return "Insight";
  }
}

function getBudgetStatusLabel(status: string) {
  switch (status) {
    case "NORMAL":
      return "Normal";

    case "WATCH":
      return "Watch";

    case "WARNING":
      return "Warning";

    case "EXCEEDED":
      return "Exceeded";

    default:
      return status;
  }
}

function getBudgetStatusClass(status: string) {
  switch (status) {
    case "EXCEEDED":
      return "bg-red-50 text-red-700 ring-red-200";

    case "WARNING":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "WATCH":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function getHealthStatusClass(status: string) {
  switch (status) {
    case "GOOD":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "WARNING":
      return "bg-red-50 text-red-700 ring-red-200";

    case "WATCH":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getTransactionMeta(type: string) {
  switch (type) {
    case "INCOME":
      return {
        sign: "+",
        color: "text-blue-600",
        label: "Pemasukan",
        icon: "↙",
      };

    case "EXPENSE":
      return {
        sign: "-",
        color: "text-slate-900",
        label: "Pengeluaran",
        icon: "↗",
      };

    case "TRANSFER":
      return {
        sign: "",
        color: "text-slate-900",
        label: "Transfer",
        icon: "⇄",
      };

    case "ADJUSTMENT":
      return {
        sign: "",
        color: "text-slate-900",
        label: "Penyesuaian",
        icon: "±",
      };

    default:
      return {
        sign: "",
        color: "text-slate-900",
        label: "Transaksi",
        icon: "•",
      };
  }
}

function formatTransactionDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildDonutGradient(
  categories: Array<{ percentage: number }>,
) {
  const stops = [
    "#155eef",
    "#3677f0",
    "#65c8f2",
    "#aebbd2",
    "#17233b",
    "#cbd2dc",
  ];

  let current = 0;

  return categories
    .slice(0, stops.length)
    .map((category, index) => {
      const start = current;

      current += Math.max(
        0,
        Number(category.percentage),
      );

      return `${stops[index]} ${start}% ${Math.min(
        current,
        100,
      )}%`;
    })
    .join(", ");
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [
    financialData,
    insightData,
    recentTransactions,
  ] = await Promise.all([
    getFinancialOverview(session.user.id),

    getUserInsights(session.user.id),

    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },

      orderBy: [
        {
          transactionDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      take: 5,

      include: {
        category: true,
        wallet: true,
        fromWallet: true,
        toWallet: true,
      },
    }),
  ]);

  const healthStatus =
    financialData.financialHealth.overallStatus;

  const primaryInsight =
    insightData.primaryInsight;

  const spendingCategories =
    financialData.spending.byCategory ?? [];

  const donutGradient =
    buildDonutGradient(spendingCategories);

  const topBudgets =
    (financialData.budget.budgets ?? []).slice(0, 4);

  const topGoals =
    (financialData.goals.goals ?? []).slice(0, 2);

  const upcoming =
    (financialData.obligations.obligations ?? []).slice(
      0,
      3,
    );

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-[#14213d]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* ==========================================
            DASHBOARD HEADER
        ========================================== */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {getGreeting()}
            </p>

            <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-[#14213d] sm:text-[32px]">
              {session.user.name ?? "User"}{" "}
              <span className="inline-block">
                👋
              </span>
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Berikut ringkasan kondisi keuanganmu
              hari ini.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-blue-500" />

              SHARKFIN CORE · AKTIF
            </div>

            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0d63e8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a2740] active:scale-[0.98]"
            >
              <span className="text-base leading-none">
                +
              </span>

              Tambah Transaksi
            </Link>
          </div>
        </header>

        <div className="mt-7 space-y-5">
          {/* ========================================
              SUMMARY
          ======================================== */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Balance"
              value={formatRupiah(
                financialData.balance.total,
              )}
              description="Saldo seluruh wallet aktif"
              icon="▣"
            />

            <SummaryCard
              label="Pemasukan Bulan Ini"
              value={formatRupiah(
                financialData.cashflow.income,
              )}
              description="Total pemasukan bulan berjalan"
              icon="↓"
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="Pengeluaran Bulan Ini"
              value={formatRupiah(
                financialData.cashflow.expense,
              )}
              description="Total pengeluaran bulan berjalan"
              icon="↑"
              iconClass="bg-red-50 text-red-500"
            />

            <SummaryCard
              label="Net Cashflow"
              value={formatRupiah(
                financialData.cashflow.netCashflow,
              )}
              description={
                financialData.cashflow.savingRate !== null
                  ? `Saving rate ${financialData.cashflow.savingRate}%`
                  : "Saving rate belum tersedia"
              }
              icon="⌁"
              valueClass={
                financialData.cashflow.netCashflow >=
                BigInt(0)
                  ? "text-[#0d5bd7]"
                  : "text-red-600"
              }
              iconClass="bg-blue-50 text-blue-600"
            />
          </section>

          {/* ========================================
              SHARKFIN INSIGHT
          ======================================== */}
          <section className="overflow-hidden rounded-2xl bg-[#121c33] p-5 text-white shadow-[0_12px_30px_rgba(17,29,53,0.12)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#073e78] text-xl">
                🦈
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6eb9ff]">
                    SharkFin Insight
                  </p>

                  {primaryInsight && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-slate-200">
                      {getInsightLabel(
                        primaryInsight.severity,
                      )}
                    </span>
                  )}
                </div>

                <h2 className="mt-1 text-base font-semibold sm:text-lg">
                  {primaryInsight?.title ??
                    "Belum ada insight penting"}
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">
                  {primaryInsight?.message ??
                    "Belum ada kondisi keuangan yang membutuhkan perhatian khusus saat ini. Terus catat transaksi agar SharkFin dapat memahami pola keuanganmu."}
                </p>
              </div>

              <Link
                href="/dashboard/insights"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0d63e8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0757d0]"
              >
                Lihat Insight →
              </Link>
            </div>
          </section>

          {/* ========================================
              SPENDING + FINANCIAL HEALTH
          ======================================== */}
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
            {/* Spending */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(17,29,53,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Spending Overview
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Rincian pengeluaran berdasarkan
                    kategori.
                  </p>
                </div>

                <Link
                  href="/dashboard/transactions"
                  className="text-xs font-semibold text-[#0d5bd7]"
                >
                  Lihat transaksi →
                </Link>
              </div>

              {spendingCategories.length > 0 ? (
                <div className="mt-6 grid gap-7 md:grid-cols-[190px_1fr] md:items-center">
                  <div
                    className="mx-auto flex h-44 w-44 items-center justify-center rounded-full p-[18px]"
                    style={{
                      background: `conic-gradient(${
                        donutGradient ||
                        "#dbe5f5 0 100%"
                      })`,
                    }}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Total Out
                      </span>

                      <span className="mt-0.5 text-xl font-bold text-[#14213d]">
                        {formatCompactRupiah(
                          financialData.spending.total,
                        )}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        bulan ini
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {spendingCategories
                      .slice(0, 6)
                      .map((category, index) => (
                        <div
                          key={
                            category.categoryId ??
                            category.categoryName
                          }
                        >
                          <div className="flex items-center justify-between gap-4 text-xs">
                            <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: [
                                    "#155eef",
                                    "#3677f0",
                                    "#65c8f2",
                                    "#aebbd2",
                                    "#17233b",
                                    "#cbd2dc",
                                  ][index],
                                }}
                              />

                              <span className="truncate">
                                {category.categoryName}
                              </span>
                            </span>

                            <span className="shrink-0 font-semibold text-slate-700">
                              {formatRupiah(
                                category.amount,
                              )}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-[#155eef]"
                                style={{
                                  width: `${Math.min(
                                    Number(
                                      category.percentage,
                                    ),
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="w-10 text-right text-[10px] text-slate-400">
                              {category.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Belum ada pengeluaran"
                  description="Mulai catat transaksi untuk melihat pola pengeluaranmu."
                  href="/dashboard/transactions"
                  action="Tambah Transaksi"
                />
              )}
            </section>

            {/* Financial Health */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(17,29,53,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Financial Health
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Indikator kondisi keuanganmu saat
                    ini.
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ring-1 ${getHealthStatusClass(
                    healthStatus,
                  )}`}
                >
                  {getHealthLabel(healthStatus)}
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                <HealthItem
                  label="Cashflow"
                  status={
                    financialData.financialHealth
                      .cashflow.status
                  }
                />

                <HealthItem
                  label="Saving Rate"
                  status={
                    financialData.financialHealth
                      .saving.status
                  }
                />

                <HealthItem
                  label="Budget Discipline"
                  status={
                    financialData.financialHealth
                      .budget.status
                  }
                />

                <HealthItem
                  label="Target Goals"
                  status={
                    financialData.financialHealth
                      .goals.status
                  }
                />

                <HealthItem
                  label="Upcoming Obligations"
                  status={
                    financialData.financialHealth
                      .obligations.status
                  }
                />
              </div>

              <div className="mt-4 rounded-xl bg-[#eef4ff] p-3.5">
                <p className="text-xs font-semibold text-[#14213d]">
                  {getHealthDescription(
                    healthStatus,
                  )}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Gunakan indikator ini sebagai
                  ringkasan, bukan sebagai skor
                  finansial mutlak.
                </p>
              </div>
            </section>
          </section>

          {/* ========================================
              BUDGET + GOALS
          ======================================== */}
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
            {/* Budget */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(17,29,53,0.04)] sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Budget Bulan Ini
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Pantau penggunaan budget yang
                    sudah ditentukan.
                  </p>
                </div>

                <Link
                  href="/dashboard/budgets"
                  className="text-xs font-semibold text-[#0d5bd7]"
                >
                  Lihat semua →
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniMetric
                  label="Total Budget"
                  value={formatRupiah(
                    financialData.budget.totalBudget,
                  )}
                />

                <MiniMetric
                  label="Sudah Digunakan"
                  value={formatRupiah(
                    financialData.budget.totalSpent,
                  )}
                />

                <MiniMetric
                  label="Sisa Budget"
                  value={formatRupiah(
                    financialData.budget.totalRemaining,
                  )}
                />
              </div>

              {topBudgets.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {topBudgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="rounded-xl bg-[#f4f7fd] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {budget.categoryName}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ${getBudgetStatusClass(
                              budget.status,
                            )}`}
                          >
                            {getBudgetStatusLabel(
                              budget.status,
                            )}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-slate-600">
                          {formatRupiah(
                            budget.spent,
                          )}{" "}
                          /{" "}
                          {formatRupiah(
                            budget.budgetAmount,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dbe5f5]">
                        <div
                          className={`h-full rounded-full ${
                            budget.status ===
                            "EXCEEDED"
                              ? "bg-red-500"
                              : budget.status ===
                                "WARNING"
                              ? "bg-amber-500"
                              : "bg-[#155eef]"
                          }`}
                          style={{
                            width: `${Math.min(
                              Number(
                                budget.usage,
                              ),
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                        <span>
                          Sisa{" "}
                          {formatRupiah(
                            budget.remaining,
                          )}
                        </span>

                        <span>
                          {budget.usage}% terpakai
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Belum ada budget bulan ini"
                  description="Buat budget untuk kategori yang ingin kamu kontrol."
                  href="/dashboard/budgets"
                  action="Buat Budget"
                />
              )}
            </section>

            {/* Goals */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(17,29,53,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Financial Goals
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Target keuangan yang sedang kamu
                    perjuangkan.
                  </p>
                </div>

                <Link
                  href="/dashboard/goals"
                  className="text-xs font-semibold text-[#0d5bd7]"
                >
                  Lihat semua →
                </Link>
              </div>

              {topGoals.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {topGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-xl bg-[#f4f7fd] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {goal.name}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            {formatRupiah(
                              goal.currentAmount,
                            )}{" "}
                            /{" "}
                            {formatRupiah(
                              goal.targetAmount,
                            )}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-[#0d5bd7]">
                          {goal.progress}%
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dbe5f5]">
                        <div
                          className="h-full rounded-full bg-[#155eef]"
                          style={{
                            width: `${Math.min(
                              Number(
                                goal.progress,
                              ),
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px] text-slate-500">
                        {goal.deadline ? (
                          <span>
                            Deadline{" "}
                            {new Date(
                              goal.deadline,
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        ) : (
                          <span>
                            Tanpa deadline
                          </span>
                        )}

                        <span>
                          {formatRupiah(
                            goal.requiredMonthlySaving,
                          )}{" "}
                          / bln
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Belum ada financial goal"
                  description="Buat target seperti Laptop, Dana Darurat, atau Liburan."
                  href="/dashboard/goals"
                  action="Buat Goal"
                />
              )}
            </section>
          </section>

          {/* ========================================
              RECENT TRANSACTIONS + UPCOMING
          ======================================== */}
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
            {/* Recent Transactions */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(17,29,53,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Recent Transactions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Catatan transaksi terbaru dari
                    seluruh wallet.
                  </p>
                </div>

                <Link
                  href="/dashboard/transactions"
                  className="text-xs font-semibold text-[#0d5bd7]"
                >
                  Semua →
                </Link>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="mt-4 divide-y divide-slate-100">
                  {recentTransactions.map(
                    (transaction) => {
                      const meta =
                        getTransactionMeta(
                          transaction.type,
                        );

                      const amount = Number(
                        transaction.amount,
                      );

                      const walletText =
                        transaction.type ===
                        "TRANSFER"
                          ? `${
                              transaction
                                .fromWallet?.name ??
                              "Wallet"
                            } → ${
                              transaction
                                .toWallet?.name ??
                              "Wallet"
                            }`
                          : transaction.wallet
                              ?.name ??
                            "Wallet";

                      const title =
                        transaction.description?.trim() ||
                        transaction.category?.name ||
                        meta.label;

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-3 py-3.5"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-sm font-bold text-[#0d5bd7]">
                            {meta.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {title}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-slate-400">
                              {walletText} ·{" "}
                              {formatTransactionDate(
                                transaction.transactionDate,
                              )}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p
                              className={`text-sm font-bold ${meta.color}`}
                            >
                              {meta.sign}
                              {formatRupiah(amount)}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-400">
                              {transaction.category
                                ?.name ??
                                meta.label}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <EmptyState
                  title="Belum ada transaksi"
                  description="Mulai catat pemasukan atau pengeluaran pertamamu."
                  href="/dashboard/transactions"
                  action="Tambah Transaksi"
                />
              )}
            </section>

            {/* Upcoming Expenses */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(17,29,53,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Upcoming Expenses
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Kewajiban keuangan yang akan datang.
                  </p>
                </div>

                <Link
                  href="/dashboard/scheduled-expenses"
                  className="text-xs font-semibold text-[#0d5bd7]"
                >
                  Kelola →
                </Link>
              </div>

              {upcoming.length > 0 ? (
                <div className="mt-4 space-y-2.5">
                  {upcoming.map((obligation) => (
                    <div
                      key={obligation.id}
                      className="rounded-xl bg-[#f4f7fd] p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {obligation.name}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            Jatuh tempo{" "}
                            {new Date(
                              obligation.nextDate,
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-slate-800">
                          {formatRupiah(
                            obligation.amount,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Tidak ada upcoming expense"
                  description="Belum ada kewajiban terjadwal yang perlu dipersiapkan."
                  href="/dashboard/scheduled-expenses"
                  action="Tambah Jadwal"
                />
              )}

              <div className="mt-4 rounded-xl bg-[#eef4ff] p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Available Balance
                </p>

                <p className="mt-1 text-xl font-bold text-[#14213d]">
                  {formatRupiah(
                    financialData.obligations
                      .availableBalance,
                  )}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Saldo setelah memperhitungkan
                  kewajiban terjadwal.
                </p>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  iconClass = "bg-slate-100 text-slate-700",
  valueClass = "text-[#14213d]",
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
  iconClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(17,29,53,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${iconClass}`}
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-4 truncate text-[22px] font-bold tracking-tight ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 truncate text-[10px] text-slate-400">
        {description}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function HealthItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f7fd] px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            status === "GOOD"
              ? "bg-emerald-500"
              : status === "WATCH"
                ? "bg-amber-500"
                : status === "WARNING"
                  ? "bg-red-500"
                  : "bg-slate-300"
          }`}
        />

        <span className="truncate text-xs font-semibold text-slate-700">
          {label}
        </span>
      </div>

      <span
        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ring-1 ${getHealthStatusClass(
          status,
        )}`}
      >
        {getHealthLabel(status)}
      </span>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center">
      <p className="text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>

      <Link
        href={href}
        className="mt-4 inline-flex rounded-lg bg-[#0d5bd7] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0757d0]"
      >
        {action}
      </Link>
    </div>
  );
}