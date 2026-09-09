import { auth } from "@/auth";
import {
  createGoal,
  getGoals,
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

export async function GET() {
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

    const goals = await getGoals(
      session.user.id
    );

    return Response.json(
      {
        goals: serializeBigInt(goals),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/goals error:",
      error
    );

    return Response.json(
      {
        error:
          "Gagal mengambil data goal.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
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

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const targetAmount =
      typeof body.targetAmount === "string"
        ? body.targetAmount
        : String(
            body.targetAmount ?? ""
          );

    const walletId =
      body.walletId === null ||
      body.walletId === undefined ||
      body.walletId === ""
        ? null
        : String(body.walletId);

    let deadline: Date | null = null;

    if (body.deadline) {
      deadline = new Date(
        body.deadline
      );

      if (Number.isNaN(
        deadline.getTime()
      )) {
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
    }

    if (!name) {
      return Response.json(
        {
          error:
            "Nama goal wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!targetAmount) {
      return Response.json(
        {
          error:
            "Target amount wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    let target: bigint;

    try {
      target = BigInt(
        targetAmount
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

    const goal = await createGoal({
      userId: session.user.id,
      walletId,
      name,
      targetAmount: target,
      deadline,
    });

    return Response.json(
      {
        goal: serializeBigInt(goal),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/goals error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Gagal membuat goal.";

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