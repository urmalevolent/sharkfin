import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

  // Belum login
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      onboardingCompleted: true,
    },
  });

  // User tidak ditemukan
  if (!user) {
    redirect("/login");
  }

  // User sudah menyelesaikan onboarding
  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}