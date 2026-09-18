import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <DashboardLayout userName={session.user.name ?? "User"}>
      {children}
    </DashboardLayout>
  );
}