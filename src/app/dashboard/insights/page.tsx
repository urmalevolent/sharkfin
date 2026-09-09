import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserInsights } from "@/services/insight.service";
import InsightsClient from "./insights-client";

export default async function InsightsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const insightData = await getUserInsights(
    session.user.id,
  );

  const insights = insightData.insights.map(
    (insight) => ({
      type: insight.type,
      severity: insight.severity,
      title: insight.title,
      message: insight.message,
      priority: insight.priority,
    }),
  );

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Financial Intelligence
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            🦈 SharkFin Insights
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ringkasan kondisi keuangan yang perlu kamu
            ketahui berdasarkan data keuanganmu.
          </p>
        </div>

        <InsightsClient
          insights={insights}
          generatedAt={insightData.generatedAt.toISOString()}
        />
      </div>
    </main>
  );
}