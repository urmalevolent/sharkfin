"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Info,
  Lightbulb,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

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

function getSeverityConfig(
  severity: InsightSeverity,
) {
  switch (severity) {
    case "CRITICAL":
      return {
        label: "Critical",
        icon: ShieldAlert,
        iconClass:
          "bg-red-500/10 text-red-600 dark:text-red-400",
        badgeClass:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        cardClass:
          "border-red-500/20 bg-red-500/[0.025]",
        accentClass: "bg-red-500",
      };

    case "WARNING":
      return {
        label: "Warning",
        icon: AlertTriangle,
        iconClass:
          "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        badgeClass:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        cardClass:
          "border-yellow-500/20 bg-yellow-500/[0.025]",
        accentClass: "bg-yellow-500",
      };

    case "INFO":
      return {
        label: "Info",
        icon: Info,
        iconClass:
          "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        badgeClass:
          "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        cardClass:
          "border-blue-500/20 bg-blue-500/[0.025]",
        accentClass: "bg-blue-500",
      };

    default:
      return {
        label: "Insight",
        icon: Lightbulb,
        iconClass:
          "bg-primary/10 text-primary",
        badgeClass:
          "border-primary/20 bg-primary/10 text-primary",
        cardClass:
          "border-border bg-card",
        accentClass: "bg-primary",
      };
  }
}

function getInsightTypeLabel(
  type: InsightType,
) {
  switch (type) {
    case "BUDGET_WARNING":
      return "Budget";

    case "BUDGET_EXCEEDED":
      return "Budget";

    case "SPENDING_SPIKE":
      return "Pengeluaran";

    case "UPCOMING_EXPENSE":
      return "Pengeluaran Mendatang";

    case "NEGATIVE_AVAILABLE_BALANCE":
      return "Saldo Tersedia";

    case "GOAL_BEHIND":
      return "Financial Goal";

    case "NEGATIVE_CASHFLOW":
      return "Cashflow";

    default:
      return "Financial Insight";
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
    <div className="space-y-6 pb-8">
      {/* =================================
          HEADER
      ================================== */}

      <section className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    SharkFin Insights
                  </h1>

                  {insights.length > 0 && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {insights.length} insight
                      {insights.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  )}
                </div>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Ringkasan kondisi keuangan yang
                  perlu kamu ketahui berdasarkan
                  data keuanganmu.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>
                Diperbarui{" "}
                {formatGeneratedAt(
                  generatedAt,
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          SUMMARY
      ================================== */}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Critical"
          value={criticalCount}
          description="Perlu perhatian segera"
          icon={ShieldAlert}
          iconClass="bg-red-500/10 text-red-600 dark:text-red-400"
        />

        <SummaryCard
          label="Warning"
          value={warningCount}
          description="Sebaiknya diperhatikan"
          icon={AlertTriangle}
          iconClass="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
        />

        <SummaryCard
          label="Info"
          value={infoCount}
          description="Informasi tambahan"
          icon={Info}
          iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
      </section>

      {/* =================================
          FILTER
      ================================== */}

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Insight Keuangan
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Pilih kategori insight yang ingin
              kamu lihat.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
              count={insights.length}
            >
              Semua
            </FilterButton>

            <FilterButton
              active={filter === "CRITICAL"}
              onClick={() =>
                setFilter("CRITICAL")
              }
              count={criticalCount}
            >
              Critical
            </FilterButton>

            <FilterButton
              active={filter === "WARNING"}
              onClick={() =>
                setFilter("WARNING")
              }
              count={warningCount}
            >
              Warning
            </FilterButton>

            <FilterButton
              active={filter === "INFO"}
              onClick={() => setFilter("INFO")}
              count={infoCount}
            >
              Info
            </FilterButton>
          </div>
        </div>
      </section>

      {/* =================================
          INSIGHT LIST HEADER
      ================================== */}

      {filteredInsights.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-semibold">
              {filter === "ALL"
                ? "Semua Insight"
                : `${getSeverityLabel(
                    filter,
                  )} Insight`}
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {filteredInsights.length} insight
              ditemukan
            </p>
          </div>

          <BellRing className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* =================================
          INSIGHTS
      ================================== */}

      {filteredInsights.length > 0 ? (
        <section className="space-y-4">
          {filteredInsights.map(
            (insight, index) => (
              <InsightCard
                key={`${insight.type}-${insight.priority}-${insight.title}`}
                insight={insight}
                index={index}
              />
            ),
          )}
        </section>
      ) : (
        <EmptyInsightState
          filter={filter}
          totalInsights={insights.length}
        />
      )}

      {/* =================================
          FOOTER INFO
      ================================== */}

      {insights.length > 0 && (
        <section className="rounded-2xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lightbulb className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Tentang SharkFin Insights
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Insight dihasilkan berdasarkan
                kondisi keuanganmu seperti budget,
                pengeluaran, cashflow, financial
                goal, dan kewajiban yang akan datang.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* =================================
   SUMMARY CARD
================================= */

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* =================================
   FILTER BUTTON
================================= */

function FilterButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <span>{children}</span>

      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          active
            ? "bg-primary-foreground/15 text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* =================================
   INSIGHT CARD
================================= */

function InsightCard({
  insight,
  index,
}: {
  insight: Insight;
  index: number;
}) {
  const config = getSeverityConfig(
    insight.severity,
  );

  const Icon = config.icon;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${config.cardClass}`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Severity accent */}

      <div
        className={`absolute left-0 top-0 h-full w-1 ${config.accentClass}`}
      />

      <div className="flex items-start gap-4 pl-1">
        {/* ICON */}

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold leading-5 sm:text-base">
                  {insight.title}
                </h2>

                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.badgeClass}`}
                >
                  {config.label}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {getInsightTypeLabel(
                    insight.type,
                  )}
                </span>

                <span>•</span>

                <span>
                  {getSeverityDescription(
                    insight.severity,
                  )}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <span>Priority</span>

              <span className="font-semibold text-foreground">
                {insight.priority}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-background/60 p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {insight.message}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />

              <span>
                Dihasilkan dari analisis
                keuanganmu
              </span>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </article>
  );
}

/* =================================
   EMPTY STATE
================================= */

function EmptyInsightState({
  filter,
  totalInsights,
}: {
  filter: FilterType;
  totalInsights: number;
}) {
  const isFiltered =
    filter !== "ALL" &&
    totalInsights > 0;

  const message = isFiltered
    ? `Belum ada insight dengan kategori ${getSeverityLabel(
        filter,
      )}.`
    : "Belum ada insight yang perlu diperhatikan saat ini.";

  return (
    <section className="rounded-3xl border border-dashed bg-card p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {isFiltered ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : (
          <Sparkles className="h-7 w-7" />
        )}
      </div>

      <h2 className="mt-5 text-base font-semibold">
        {isFiltered
          ? "Tidak ada insight"
          : "Keuanganmu terlihat tenang"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {message}
      </p>

      {!isFiltered && (
        <div className="mx-auto mt-5 flex max-w-md items-start gap-3 rounded-xl border bg-background p-4 text-left">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

          <p className="text-xs leading-5 text-muted-foreground">
            Terus catat transaksi agar SharkFin
            dapat memahami pola keuanganmu dan
            memberikan insight ketika ada kondisi
            yang perlu diperhatikan.
          </p>
        </div>
      )}
    </section>
  );
}