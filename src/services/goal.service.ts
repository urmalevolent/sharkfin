import { prisma } from "@/lib/prisma";

type CreateGoalInput = {
  userId: string;
  walletId?: string | null;
  name: string;
  targetAmount: bigint;
  deadline?: Date | null;
};

type UpdateGoalInput = {
  walletId?: string | null;
  name?: string;
  targetAmount?: bigint;
  deadline?: Date | null;
};

function validateName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Nama goal wajib diisi.");
  }

  if (trimmedName.length > 100) {
    throw new Error(
      "Nama goal maksimal 100 karakter."
    );
  }
}

function validateTargetAmount(
  targetAmount: bigint
) {
  if (targetAmount <= BigInt(0)) {
    throw new Error(
      "Target goal harus lebih dari 0."
    );
  }
}

function validateDeadline(
  deadline?: Date | null
) {
  if (deadline === null || deadline === undefined) {
    return;
  }

  if (Number.isNaN(deadline.getTime())) {
    throw new Error(
      "Tanggal deadline tidak valid."
    );
  }
}

async function validateWallet(
  userId: string,
  walletId?: string | null
) {
  if (!walletId) {
    return null;
  }

  const wallet =
    await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId,
        isActive: true,
      },
    });

  if (!wallet) {
    throw new Error(
      "Wallet tidak ditemukan atau tidak aktif."
    );
  }

  return wallet;
}

function calculateProgress(
  currentAmount: bigint,
  targetAmount: bigint
) {
  if (targetAmount <= BigInt(0)) {
    return 0;
  }

  const progress =
    Number(
      (currentAmount * BigInt(10000)) /
        targetAmount
    ) / 100;

  return Math.min(
    Math.max(progress, 0),
    100
  );
}

function calculateRequiredMonthlySaving(
  currentAmount: bigint,
  targetAmount: bigint,
  deadline: Date | null
) {
  if (!deadline) {
    return null;
  }

  const now = new Date();

  if (deadline <= now) {
    const remaining =
      targetAmount > currentAmount
        ? targetAmount - currentAmount
        : BigInt(0);

    return remaining;
  }

  const remaining =
    targetAmount > currentAmount
      ? targetAmount - currentAmount
      : BigInt(0);

  if (remaining <= BigInt(0)) {
    return BigInt(0);
  }

  const months =
    (deadline.getFullYear() -
      now.getFullYear()) *
      12 +
    (deadline.getMonth() -
      now.getMonth());

  const effectiveMonths =
    Math.max(months, 1);

  return (
    remaining /
    BigInt(effectiveMonths)
  );
}

async function calculateGoal(
  goal: {
    id: string;
    userId: string;
    walletId: string | null;
    name: string;
    targetAmount: bigint;
    deadline: Date | null;
    createdAt: Date;
    updatedAt: Date;
    wallet: {
      id: string;
      name: string;
      balance: bigint;
    } | null;
  }
) {
  const currentAmount =
    goal.wallet?.balance ??
    BigInt(0);

  const remaining =
    goal.targetAmount > currentAmount
      ? goal.targetAmount -
        currentAmount
      : BigInt(0);

  const progress =
    calculateProgress(
      currentAmount,
      goal.targetAmount
    );

  const requiredMonthlySaving =
    calculateRequiredMonthlySaving(
      currentAmount,
      goal.targetAmount,
      goal.deadline
    );

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

    deadline: goal.deadline,

    requiredMonthlySaving,

    completed,

    wallet: goal.wallet
      ? {
          id: goal.wallet.id,
          name: goal.wallet.name,
          balance:
            goal.wallet.balance,
        }
      : null,

    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

export async function getGoals(
  userId: string
) {
  const goals =
    await prisma.goal.findMany({
      where: {
        userId,
      },

      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },

      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

  return Promise.all(
    goals.map((goal) =>
      calculateGoal(goal)
    )
  );
}

export async function getGoalById(
  userId: string,
  goalId: string
) {
  const goal =
    await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },

      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },
    });

  if (!goal) {
    throw new Error(
      "Goal tidak ditemukan."
    );
  }

  return calculateGoal(goal);
}

export async function createGoal(
  input: CreateGoalInput
) {
  const {
    userId,
    walletId,
    name,
    targetAmount,
    deadline,
  } = input;

  validateName(name);
  validateTargetAmount(
    targetAmount
  );
  validateDeadline(deadline);

  await validateWallet(
    userId,
    walletId
  );

  const goal =
    await prisma.goal.create({
      data: {
        userId,
        walletId:
          walletId || null,
        name: name.trim(),
        targetAmount,
        deadline:
          deadline || null,
      },

      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },
    });

  return calculateGoal(goal);
}

export async function updateGoal(
  userId: string,
  goalId: string,
  input: UpdateGoalInput
) {
  const existingGoal =
    await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

  if (!existingGoal) {
    throw new Error(
      "Goal tidak ditemukan."
    );
  }

  const name =
    input.name ??
    existingGoal.name;

  const targetAmount =
    input.targetAmount ??
    existingGoal.targetAmount;

  const walletId =
    input.walletId !== undefined
      ? input.walletId
      : existingGoal.walletId;

  const deadline =
    input.deadline !== undefined
      ? input.deadline
      : existingGoal.deadline;

  validateName(name);

  validateTargetAmount(
    targetAmount
  );

  validateDeadline(deadline);

  await validateWallet(
    userId,
    walletId
  );

  const updatedGoal =
    await prisma.goal.update({
      where: {
        id: goalId,
      },

      data: {
        name: name.trim(),
        targetAmount,
        walletId:
          walletId || null,
        deadline:
          deadline || null,
      },

      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },
    });

  return calculateGoal(
    updatedGoal
  );
}

export async function deleteGoal(
  userId: string,
  goalId: string
) {
  const goal =
    await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

  if (!goal) {
    throw new Error(
      "Goal tidak ditemukan."
    );
  }

  await prisma.goal.delete({
    where: {
      id: goalId,
    },
  });

  return {
    success: true,
  };
}