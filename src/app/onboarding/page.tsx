import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

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

  if (!user) {
    redirect("/login");
  }

  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}