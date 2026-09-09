import { auth } from "@/auth";
import {
  deleteGoal,
  getGoalById,
  updateGoal,
} from "@/services/goal.service";

function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, currentValue) =>
      typeof currentValue === "bigint"
        ? currentValue.toString()
        : currentValue
    )
  );
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const goal =
      await getGoalById(
        session.user.id,
        id
      );

    return Response.json(
      {
        goal: serializeBigInt(goal),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/goals/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Goal tidak ditemukan.";

    return Response.json(
      {
        error: message,
      },
      {
        status: 404,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const body = await request.json();

    const input: {
      name?: string;
      targetAmount?: bigint;
      walletId?: string | null;
      deadline?: Date | null;
    } = {};

    if (
      body.name !== undefined
    ) {
      if (
        typeof body.name !==
        "string"
      ) {
        return Response.json(
          {
            error:
              "Nama goal tidak valid.",
          },
          {
            status: 400,
          }
        );
      }

      input.name =
        body.name.trim();
    }

    if (
      body.targetAmount !==
      undefined
    ) {
      try {
        input.targetAmount =
          BigInt(
            String(
              body.targetAmount
            )
          );
      } catch {
        return Response.json(
          {
            error:
              "Target amount harus berupa angka bulat.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      body.walletId !==
      undefined
    ) {
      input.walletId =
        body.walletId === null ||
        body.walletId === ""
          ? null
          : String(
              body.walletId
            );
    }

    if (
      body.deadline !==
      undefined
    ) {
      if (
        body.deadline === null ||
        body.deadline === ""
      ) {
        input.deadline = null;
      } else {
        const deadline =
          new Date(
            body.deadline
          );

        if (
          Number.isNaN(
            deadline.getTime()
          )
        ) {
          return Response.json(
            {
              error:
                "Tanggal deadline tidak valid.",
            },
            {
              status: 400,
            }
          );
        }

        input.deadline =
          deadline;
      }
    }

    const goal =
      await updateGoal(
        session.user.id,
        id,
        input
      );

    return Response.json(
      {
        goal: serializeBigInt(goal),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH /api/goals/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengubah goal.";

    return Response.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    await deleteGoal(
      session.user.id,
      id
    );

    return Response.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE /api/goals/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menghapus goal.";

    return Response.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}