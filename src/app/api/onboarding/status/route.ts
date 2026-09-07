import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
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
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    console.error("Onboarding status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengecek status onboarding.",
      },
      { status: 500 }
    );
  }
}