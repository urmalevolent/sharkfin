import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { getFinancialOverview } from "@/services/financial-engine.service";
import { getUserInsights } from "@/services/insight.service";

function formatRupiah(value: string | number | bigint) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
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
      return "Kondisi keuanganmu terlihat baik.";

    case "WATCH":
      return "Ada beberapa hal yang sebaiknya kamu perhatikan.";

    case "WARNING":
      return "Ada kondisi keuangan yang membutuhkan perhatian.";

    default:
      return "Belum cukup data untuk melakukan penilaian.";
  }
}

function getInsightLabel(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "Perlu tindakan segera";

    case "WARNING":
      return "Perlu diperhatikan";

    case "INFO":
      return "Informasi";

    default:
      return "Insight";
  }
}

function getInsightDescription(
  severity: string,
  message: string,
) {
  switch (severity) {
    case "CRITICAL":
      return message;

    case "WARNING":
      return message;

    case "INFO":
      return message;

    default:
      return message;
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  /*
   * Dashboard merupakan Server Component.
   *
   * Financial Engine dan Insight Engine dipanggil
   * langsung melalui service tanpa melakukan fetch HTTP.
   *
   * Financial Engine:
   * Database
   *   ↓
   * Financial Metrics
   *
   * Insight Engine:
   * Financial Metrics
   *   ↓
   * Insight Trigger
   *   ↓
   * Priority Engine
   *   ↓
   * Primary Insight
   */

  const [financialData, insightData] =
    await Promise.all([
      getFinancialOverview(session.user.id),
      getUserInsights(session.user.id),
    ]);

  const healthStatus =
    financialData.financialHealth.overallStatus;

  const primaryInsight =
    insightData.primaryInsight;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ================================
            HEADER
        ================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {getGreeting()}
            </p>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {session.user.name} 👋
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Kelola dan pahami kondisi keuanganmu
              bersama SharkFin.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* ================================
            DASHBOARD CONTENT
        ================================= */}

        <div className="mt-8 space-y-6">
          {/* ================================
              TOTAL BALANCE
          ================================= */}

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Total Balance
              </p>

              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {formatRupiah(
                  financialData.balance.total,
                )}
              </h2>

              <p className="text-sm text-muted-foreground">
                Total uang yang tersedia di seluruh
                wallet aktifmu.
              </p>
            </div>
          </section>

          {/* ================================
              CASHFLOW
          ================================= */}

          <section className="grid gap-4 md:grid-cols-3">
            {/* INCOME */}

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Income Bulan Ini
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatRupiah(
                  financialData.cashflow.income,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Total pemasukan bulan berjalan.
              </p>
            </div>

            {/* EXPENSE */}

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Expense Bulan Ini
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatRupiah(
                  financialData.cashflow.expense,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Total pengeluaran bulan berjalan.
              </p>
            </div>

            {/* NET CASHFLOW */}

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Net Cashflow
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatRupiah(
                  financialData.cashflow.netCashflow,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Saving Rate:{" "}
                {financialData.cashflow.savingRate !==
                null
                  ? `${financialData.cashflow.savingRate}%`
                  : "N/A"}
              </p>
            </div>
          </section>

          {/* ================================
              SHARKFIN INSIGHT
          ================================= */}

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                🦈
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <h2 className="font-semibold">
                    SharkFin Insight
                  </h2>

                  {primaryInsight && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {getInsightLabel(
                        primaryInsight.severity,
                      )}
                    </span>
                  )}
                </div>

                {primaryInsight ? (
                  <>
                    <p className="mt-2 text-sm font-medium">
                      {primaryInsight.title}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {getInsightDescription(
                        primaryInsight.severity,
                        primaryInsight.message,
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-medium">
                      Belum ada insight penting
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Belum ada kondisi keuangan yang
                      membutuhkan perhatian khusus saat
                      ini. Terus catat transaksi agar
                      SharkFin dapat memahami pola
                      keuanganmu.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ================================
              SPENDING + FINANCIAL HEALTH
          ================================= */}

          <section className="grid gap-6 lg:grid-cols-2">
            {/* SPENDING OVERVIEW */}

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    Spending Overview
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Pengeluaran bulan ini
                  </p>
                </div>

                <p className="font-semibold">
                  {formatRupiah(
                    financialData.spending.total,
                  )}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {financialData.spending.byCategory
                  ?.length > 0 ? (
                  financialData.spending.byCategory.map(
                    (category) => (
                      <div
                        key={
                          category.categoryId ??
                          category.categoryName
                        }
                        className="space-y-2"
                      >
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="truncate">
                            {category.categoryName}
                          </span>

                          <span className="shrink-0 text-muted-foreground">
                            {formatRupiah(
                              category.amount,
                            )}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(
                                category.percentage,
                                100,
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="text-right text-xs text-muted-foreground">
                          {category.percentage}%
                        </p>
                      </div>
                    ),
                  )
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm font-medium">
                      Belum ada pengeluaran
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Mulai catat transaksi untuk
                      melihat pola pengeluaranmu.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FINANCIAL HEALTH */}

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div>
                <h2 className="font-semibold">
                  Financial Health
                </h2>

                <p className="text-sm text-muted-foreground">
                  Gambaran kondisi keuanganmu saat ini.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <HealthItem
                  label="Cashflow"
                  status={
                    financialData.financialHealth
                      .cashflow.status
                  }
                />

                <HealthItem
                  label="Saving"
                  status={
                    financialData.financialHealth
                      .saving.status
                  }
                />

                <HealthItem
                  label="Budget"
                  status={
                    financialData.financialHealth
                      .budget.status
                  }
                />

                <HealthItem
                  label="Goals"
                  status={
                    financialData.financialHealth
                      .goals.status
                  }
                />

                <HealthItem
                  label="Obligations"
                  status={
                    financialData.financialHealth
                      .obligations.status
                  }
                />
              </div>

              <div className="mt-6 rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Overall Status
                </p>

                <p className="mt-1 font-semibold">
                  {getHealthLabel(healthStatus)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {getHealthDescription(
                    healthStatus,
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* ================================
              BUDGET
          ================================= */}

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">
                  Budget
                </h2>

                <p className="text-sm text-muted-foreground">
                  Penggunaan budget bulan ini.
                </p>
              </div>

              <p className="text-sm font-medium">
                {financialData.budget.budgetCount}{" "}
                kategori
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatBox
                label="Total Budget"
                value={formatRupiah(
                  financialData.budget.totalBudget,
                )}
              />

              <StatBox
                label="Sudah Digunakan"
                value={formatRupiah(
                  financialData.budget.totalSpent,
                )}
              />

              <StatBox
                label="Sisa Budget"
                value={formatRupiah(
                  financialData.budget.totalRemaining,
                )}
              />
            </div>

            {financialData.budget.budgets?.length >
              0 && (
              <div className="mt-6 space-y-4">
                {financialData.budget.budgets.map(
                  (budget) => (
                    <div
                      key={budget.id}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium">
                          {budget.categoryName}
                        </span>

                        <span className="text-muted-foreground">
                          {budget.usage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(
                              budget.usage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Terpakai{" "}
                          {formatRupiah(
                            budget.spent,
                          )}
                        </span>

                        <span>
                          Budget{" "}
                          {formatRupiah(
                            budget.budgetAmount,
                          )}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* ================================
              GOALS + UPCOMING EXPENSES
          ================================= */}

          <section className="grid gap-6 lg:grid-cols-2">
            {/* GOALS */}

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div>
                <h2 className="font-semibold">
                  🎯 Financial Goals
                </h2>

                <p className="text-sm text-muted-foreground">
                  Target keuangan yang sedang kamu
                  perjuangkan.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                {financialData.goals.goals?.length >
                0 ? (
                  financialData.goals.goals.map(
                    (goal) => (
                      <div
                        key={goal.id}
                        className="space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              {goal.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {formatRupiah(
                                goal.currentAmount,
                              )}{" "}
                              /{" "}
                              {formatRupiah(
                                goal.targetAmount,
                              )}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-medium">
                            {goal.progress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(
                                goal.progress,
                                100,
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          {goal.deadline && (
                            <p className="text-xs text-muted-foreground">
                              Deadline:{" "}
                              {new Date(
                                goal.deadline,
                              ).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Kebutuhan tabungan per bulan:{" "}
                            {formatRupiah(
                              goal.requiredMonthlySaving,
                            )}
                          </p>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm font-medium">
                      Belum ada financial goal
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Buat target seperti Laptop,
                      Dana Darurat, atau Liburan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* UPCOMING EXPENSES */}

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div>
                <h2 className="font-semibold">
                  📅 Upcoming Expenses
                </h2>

                <p className="text-sm text-muted-foreground">
                  Kewajiban keuangan yang akan datang.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {financialData.obligations.obligations
                  ?.length > 0 ? (
                  financialData.obligations.obligations.map(
                    (obligation) => (
                      <div
                        key={obligation.id}
                        className="flex items-center justify-between gap-4 rounded-xl border p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {obligation.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              obligation.nextDate,
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 font-semibold">
                          {formatRupiah(
                            obligation.amount,
                          )}
                        </p>
                      </div>
                    ),
                  )
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm font-medium">
                      Tidak ada pengeluaran terjadwal
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Belum ada kewajiban yang perlu
                      dipersiapkan.
                    </p>
                  </div>
                )}
              </div>

              {/* AVAILABLE BALANCE */}

              <div className="mt-6 rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Available Balance
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatRupiah(
                    financialData.obligations
                      .availableBalance,
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Saldo setelah memperhitungkan
                  kewajiban terjadwal.
                </p>
              </div>
            </div>
          </section>

          {/* ================================
              FORECAST
          ================================= */}

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div>
              <h2 className="font-semibold">
                📈 Financial Forecast
              </h2>

              <p className="text-sm text-muted-foreground">
                Perkiraan kondisi saldo sampai akhir
                bulan berdasarkan pola pengeluaranmu.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatBox
                label="Available Balance"
                value={formatRupiah(
                  financialData.forecast
                    .availableBalance,
                )}
              />

              <StatBox
                label="Rata-rata Pengeluaran/Hari"
                value={formatRupiah(
                  financialData.forecast
                    .averageDailySpending,
                )}
              />

              <StatBox
                label="Proyeksi Pengeluaran"
                value={formatRupiah(
                  financialData.forecast
                    .projectedRemainingSpending,
                )}
              />

              <StatBox
                label="Estimasi Saldo Akhir"
                value={formatRupiah(
                  financialData.forecast
                    .estimatedEndBalance,
                )}
              />
            </div>

            <div className="mt-6 rounded-xl border border-dashed p-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <span className="text-sm text-muted-foreground">
                  Sisa hari dalam periode
                </span>

                <span className="font-semibold">
                  {
                    financialData.forecast
                      .remainingDays
                  }{" "}
                  hari
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ================================
   STAT BOX
================================ */

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 font-semibold">
        {value}
      </p>
    </div>
  );
}

/* ================================
   FINANCIAL HEALTH ITEM
================================ */

function HealthItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const labelStatus =
    status === "GOOD"
      ? "Sehat"
      : status === "WATCH"
        ? "Perlu diperhatikan"
        : status === "WARNING"
          ? "Perlu perhatian"
          : "Belum tersedia";

  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <span className="text-sm font-medium">
        {label}
      </span>

      <span className="text-xs font-medium">
        {labelStatus}
      </span>
    </div>
  );
}