import type {
  AIContext,
} from "@/lib/ai/context";

function formatRupiah(
  amount: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

function formatDate(
  date: string | null,
): string {
  if (!date) {
    return "Tidak ada";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
    },
  ).format(new Date(date));
}

export function buildFinancialPrompt(
  context: AIContext,
  userQuestion: string,
): string {
  const topCategories =
    context.spending.topCategories.length > 0
      ? context.spending.topCategories
          .map(
            (category, index) =>
              `${index + 1}. ${category.categoryName}: ${formatRupiah(category.amount)} (${category.percentage}%)`,
          )
          .join("\n")
      : "Belum ada data pengeluaran.";

  const budgets =
    context.budget.budgets.length > 0
      ? context.budget.budgets
          .map(
            (budget) =>
              `- ${budget.categoryName}: ${formatRupiah(budget.spent)} / ${formatRupiah(budget.budgetAmount)} (${budget.usage}%, status ${budget.status})`,
          )
          .join("\n")
      : "Belum ada budget.";

  const goals =
    context.goals.goals.length > 0
      ? context.goals.goals
          .map(
            (goal) =>
              `- ${goal.name}: ${formatRupiah(goal.currentAmount)} / ${formatRupiah(goal.targetAmount)} (${goal.progress}%), sisa ${formatRupiah(goal.remaining)}, target ${formatDate(goal.deadline)}, kebutuhan tabungan bulanan ${formatRupiah(goal.requiredMonthlySaving)}`,
          )
          .join("\n")
      : "Belum ada financial goal.";

  const upcoming =
    context.obligations.upcoming.length > 0
      ? context.obligations.upcoming
          .map(
            (obligation) =>
              `- ${obligation.name}: ${formatRupiah(obligation.amount)} pada ${formatDate(obligation.nextDate)}`,
          )
          .join("\n")
      : "Tidak ada kewajiban terjadwal.";

  const insights =
    context.insights.length > 0
      ? context.insights
          .map(
            (insight) =>
              `- [${insight.severity}] ${insight.title}: ${insight.message}`,
          )
          .join("\n")
      : "Tidak ada insight penting saat ini.";

  return `
DATA KEUANGAN PENGGUNA

Nama:
${context.user.name}

====================
SALDO
====================

Total Balance:
${formatRupiah(context.balance.total)}

Available Balance:
${formatRupiah(context.obligations.availableBalance)}

====================
CASHFLOW
====================

Income bulan ini:
${formatRupiah(context.cashflow.income)}

Expense bulan ini:
${formatRupiah(context.cashflow.expense)}

Net Cashflow:
${formatRupiah(context.cashflow.netCashflow)}

Saving Rate:
${
  context.cashflow.savingRate !== null
    ? `${context.cashflow.savingRate}%`
    : "Belum dapat dihitung"
}

====================
SPENDING
====================

Total Spending:
${formatRupiah(context.spending.total)}

Rata-rata pengeluaran per hari:
${formatRupiah(context.spending.averageDaily)}

Jumlah transaksi:
${context.spending.transactionCount}

Top Spending Categories:
${topCategories}

Trend:
- Current: ${formatRupiah(context.spending.trend.current)}
- Previous: ${formatRupiah(context.spending.trend.previous)}
- Perubahan: ${
    context.spending.trend.changePercentage !== null
      ? `${context.spending.trend.changePercentage}%`
      : "Belum tersedia"
  }
- Direction: ${context.spending.trend.direction}

====================
BUDGET
====================

Total Budget:
${formatRupiah(context.budget.totalBudget)}

Total Terpakai:
${formatRupiah(context.budget.totalSpent)}

Total Tersisa:
${formatRupiah(context.budget.totalRemaining)}

Budget:
${budgets}

====================
FINANCIAL GOALS
====================

Total Goals:
${context.goals.totalGoals}

Goal Aktif:
${context.goals.activeGoals}

Goal Selesai:
${context.goals.completedGoals}

Goals:
${goals}

====================
KEWAJIBAN TERJADWAL
====================

Total Upcoming:
${formatRupiah(context.obligations.totalUpcoming)}

Jumlah kewajiban:
${context.obligations.obligationCount}

Upcoming:
${upcoming}

====================
FORECAST
====================

Current Balance:
${formatRupiah(context.forecast.currentBalance)}

Upcoming Obligations:
${formatRupiah(context.forecast.upcomingObligations)}

Available Balance:
${formatRupiah(context.forecast.availableBalance)}

Current Spending:
${formatRupiah(context.forecast.spending)}

Rata-rata Daily Spending:
${formatRupiah(context.forecast.averageDailySpending)}

Projected Remaining Spending:
${formatRupiah(context.forecast.projectedRemainingSpending)}

Estimated End Balance:
${formatRupiah(context.forecast.estimatedEndBalance)}

Sisa hari periode:
${context.forecast.remainingDays}

====================
FINANCIAL HEALTH
====================

Overall:
${context.financialHealth.overallStatus}

Cashflow:
${context.financialHealth.cashflow.status}

Saving:
${context.financialHealth.saving.status}

Budget:
${context.financialHealth.budget.status}

Goals:
${context.financialHealth.goals.status}

Obligations:
${context.financialHealth.obligations.status}

====================
SHARKFIN INSIGHTS
====================

${insights}

====================
PERTANYAAN USER
====================

${userQuestion}

====================
INSTRUKSI JAWABAN
====================

Jawab pertanyaan user berdasarkan data finansial di atas.

Jangan mengarang data.

Jika pertanyaan membutuhkan keputusan finansial, jelaskan
pertimbangan utama sebelum memberikan rekomendasi.

Jika data tidak cukup, katakan data apa yang masih dibutuhkan.

Jawaban harus relevan dengan kondisi finansial pengguna saat ini.
`;
}