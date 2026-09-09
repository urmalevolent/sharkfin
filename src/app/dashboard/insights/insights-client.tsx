"use client";

import { useMemo, useState } from "react";

type InsightSeverity =
  | "INFO"
  | "WARNING"
  | "CRITICAL";

type InsightType =
  | "BUDGET_WARNING"
  | "BUDGET_EXCEEDED"
  | "SPENDING_SPIKE"
  | "UPCOMING_EXPENSE"
  | "NEGATIVE_AVAILABLE_BALANCE"
  | "GOAL_BEHIND"
  | "NEGATIVE_CASHFLOW";

type Insight = {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  priority: number;
};

type FilterType =
  | "ALL"
  | "CRITICAL"
  | "WARNING"
  | "INFO";

type InsightsClientProps = {
  insights: Insight[];
  generatedAt: string;
};

function getSeverityLabel(
  severity: InsightSeverity,
) {
  switch (severity) {
    case "CRITICAL":
      return "Critical";

    case "WARNING":
      return "Warning";

    case "INFO":
      return "Info";

    default:
      return "Insight";
  }
}

function getSeverityDescription(
  severity: InsightSeverity,
) {
  switch (severity) {
    case "CRITICAL":
      return "Perlu perhatian segera.";

    case "WARNING":
      return "Sebaiknya diperhatikan.";

    case "INFO":
      return "Informasi mengenai kondisi keuanganmu.";

    default:
      return "";
  }
}

function getSeverityIcon(
  severity: InsightSeverity,
) {
  switch (severity) {
    case "CRITICAL":
      return "🔴";

    case "WARNING":
      return "🟡";

    case "INFO":
      return "🔵";

    default:
      return "💡";
  }
}

function getSeverityClass(
  severity: InsightSeverity,
) {
  switch (severity) {
    case "CRITICAL":
      return "border-red-500/30 bg-red-500/5";

    case "WARNING":
      return "border-yellow-500/30 bg-yellow-500/5";

    case "INFO":
      return "border-blue-500/30 bg-blue-500/5";

    default:
      return "";
  }
}

function getSeverityTextClass(
  severity: InsightSeverity,
) {
  switch (severity) {
    case "CRITICAL":
      return "text-red-600 dark:text-red-400";

    case "WARNING":
      return "text-yellow-600 dark:text-yellow-400";

    case "INFO":
      return "text-blue-600 dark:text-blue-400";

    default:
      return "text-muted-foreground";
  }
}

function formatGeneratedAt(
  generatedAt: string,
) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(generatedAt));
}

export default function InsightsClient({
  insights,
  generatedAt,
}: InsightsClientProps) {
  const [filter, setFilter] =
    useState<FilterType>("ALL");

  const filteredInsights = useMemo(() => {
    if (filter === "ALL") {
      return insights;
    }

    return insights.filter(
      (insight) =>
        insight.severity === filter,
    );
  }, [insights, filter]);

  const criticalCount = insights.filter(
    (insight) =>
      insight.severity === "CRITICAL",
  ).length;

  const warningCount = insights.filter(
    (insight) =>
      insight.severity === "WARNING",
  ).length;

  const infoCount = insights.filter(
    (insight) =>
      insight.severity === "INFO",
  ).length;

  return (
    <div className="space-y-6">
      {/* ================================
          SUMMARY
      ================================= */}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Critical"
          value={criticalCount}
          description="Perlu perhatian segera"
        />

        <SummaryCard
          label="Warning"
          value={warningCount}
          description="Perlu diperhatikan"
        />

        <SummaryCard
          label="Info"
          value={infoCount}
          description="Informasi tambahan"
        />
      </section>

      {/* ================================
          FILTER
      ================================= */}

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          >
            Semua
          </FilterButton>

          <FilterButton
            active={filter === "CRITICAL"}
            onClick={() =>
              setFilter("CRITICAL")
            }
          >
            🔴 Critical
          </FilterButton>

          <FilterButton
            active={filter === "WARNING"}
            onClick={() =>
              setFilter("WARNING")
            }
          >
            🟡 Warning
          </FilterButton>

          <FilterButton
            active={filter === "INFO"}
            onClick={() => setFilter("INFO")}
          >
            🔵 Info
          </FilterButton>
        </div>
      </section>

      {/* ================================
          INSIGHTS
      ================================= */}

      {filteredInsights.length > 0 ? (
        <section className="space-y-4">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={`${insight.type}-${insight.priority}-${insight.title}`}
              insight={insight}
            />
          ))}
        </section>
      ) : (
        <EmptyInsightState filter={filter} />
      )}

      {/* ================================
          GENERATED TIME
      ================================= */}

      <p className="text-center text-xs text-muted-foreground">
        Insight terakhir diperbarui{" "}
        {formatGeneratedAt(generatedAt)}
      </p>
    </div>
  );
}

/* ================================
   SUMMARY CARD
================================ */

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* ================================
   FILTER BUTTON
================================ */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-background hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

/* ================================
   INSIGHT CARD
================================ */

function InsightCard({
  insight,
}: {
  insight: Insight;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${getSeverityClass(
        insight.severity,
      )}`}
    >
      <div className="flex items-start gap-4">
        {/* ICON */}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background text-xl shadow-sm">
          {getSeverityIcon(
            insight.severity,
          )}
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">
                  {insight.title}
                </h2>

                <span
                  className={`text-xs font-medium ${getSeverityTextClass(
                    insight.severity,
                  )}`}
                >
                  {getSeverityLabel(
                    insight.severity,
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {getSeverityDescription(
                  insight.severity,
                )}
              </p>
            </div>

            <span className="shrink-0 text-xs text-muted-foreground">
              Priority {insight.priority}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {insight.message}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ================================
   EMPTY STATE
================================ */

function EmptyInsightState({
  filter,
}: {
  filter: FilterType;
}) {
  const message =
    filter === "ALL"
      ? "Belum ada insight yang perlu diperhatikan saat ini."
      : `Belum ada insight dengan kategori ${getSeverityLabel(
          filter,
        )}.`;

  return (
    <section className="rounded-2xl border border-dashed bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
        🦈
      </div>

      <h2 className="mt-4 font-semibold">
        Tidak ada insight
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {message}
      </p>

      <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
        Terus catat transaksi agar SharkFin dapat
        memahami pola keuanganmu dengan lebih baik.
      </p>
    </section>
  );
}