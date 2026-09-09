import { prisma } from "@/lib/prisma";

function calculateMonthsToDeadline(
  deadline: Date,
) {
  const now = new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();

  const deadlineYear =
    deadline.getFullYear();

  const deadlineMonth =
    deadline.getMonth();

  const months =
    (deadlineYear - currentYear) * 12 +
    (deadlineMonth - currentMonth);

  return Math.max(0, months);
}

export async function getGoalMetrics(
  userId: string,
) {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
    },
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          balance: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const metrics = goals.map((goal) => {
    const currentAmount =
      goal.wallet?.balance ??
      BigInt(0);

    const remaining =
      goal.targetAmount >
      currentAmount
        ? goal.targetAmount -
          currentAmount
        : BigInt(0);

    const progress =
      goal.targetAmount > BigInt(0)
        ? Math.min(
            100,
            Number(
              (
                (Number(currentAmount) /
                  Number(
                    goal.targetAmount,
                  )) *
                100
              ).toFixed(2),
            ),
          )
        : 0;

    let requiredMonthlySaving =
      BigInt(0);

    let monthsToDeadline:
      | number
      | null = null;

    if (
      goal.deadline &&
      remaining > BigInt(0)
    ) {
      monthsToDeadline =
        calculateMonthsToDeadline(
          goal.deadline,
        );

      if (monthsToDeadline > 0) {
        requiredMonthlySaving =
          (remaining +
            BigInt(
              monthsToDeadline - 1,
            )) /
          BigInt(monthsToDeadline);
      } else {
        requiredMonthlySaving =
          remaining;
      }
    }

    const completed =
      currentAmount >=
      goal.targetAmount;

    return {
      id: goal.id,
      name: goal.name,

      targetAmount:
        goal.targetAmount,

      currentAmount,

      remaining,

      progress,

      deadline:
        goal.deadline,

      monthsToDeadline,

      requiredMonthlySaving,

      completed,

      wallet: goal.wallet
        ? {
            id: goal.wallet.id,
            name: goal.wallet.name,
            balance:
              goal.wallet.balance,
            isActive:
              goal.wallet.isActive,
          }
        : null,
    };
  });

  const activeGoals =
    metrics.filter(
      (goal) => !goal.completed,
    );

  const completedGoals =
    metrics.filter(
      (goal) => goal.completed,
    );

  const nearestDeadline =
    activeGoals
      .filter(
        (goal) => goal.deadline,
      )
      .sort(
        (a, b) =>
          a.deadline!.getTime() -
          b.deadline!.getTime(),
      )[0] ?? null;

  return {
    totalGoals: metrics.length,

    activeGoals:
      activeGoals.length,

    completedGoals:
      completedGoals.length,

    nearestDeadline:
      nearestDeadline
        ? {
            id:
              nearestDeadline.id,
            name:
              nearestDeadline.name,
            deadline:
              nearestDeadline.deadline,
            progress:
              nearestDeadline.progress,
            requiredMonthlySaving:
              nearestDeadline.requiredMonthlySaving,
          }
        : null,

    goals: metrics,
  };
}