export type AffordabilityStatus =
  | "SAFE"
  | "CAUTION"
  | "RISKY"
  | "NOT_AFFORDABLE";

export type AffordabilityInput = {
  totalBalance: bigint;
  upcomingObligations: bigint;
  expectedSpending: bigint;
  purchaseAmount: bigint;
  goalCommitment?: bigint;
};

export type AffordabilityResult = {
  status: AffordabilityStatus;

  totalBalance: bigint;

  upcomingObligations: bigint;

  expectedSpending: bigint;

  goalCommitment: bigint;

  purchaseAmount: bigint;

  availableAfterObligations: bigint;

  safeRoom: bigint;

  remainingAfterPurchase: bigint;

  remainingAfterGoalCommitment: bigint;

  utilizationRate: number;

  reasons: string[];
};

export function calculateAffordability(
  input: AffordabilityInput,
): AffordabilityResult {
  const {
    totalBalance,
    upcomingObligations,
    expectedSpending,
    purchaseAmount,
    goalCommitment = BigInt(0),
  } = input;

  if (totalBalance < BigInt(0)) {
    throw new Error("Total balance tidak boleh negatif.");
  }

  if (upcomingObligations < BigInt(0)) {
    throw new Error(
      "Upcoming obligations tidak boleh negatif.",
    );
  }

  if (expectedSpending < BigInt(0)) {
    throw new Error(
      "Expected spending tidak boleh negatif.",
    );
  }

  if (purchaseAmount <= BigInt(0)) {
    throw new Error(
      "Purchase amount harus lebih besar dari 0.",
    );
  }

  if (goalCommitment < BigInt(0)) {
    throw new Error(
      "Goal commitment tidak boleh negatif.",
    );
  }

  /*
   * Money that remains after known obligations.
   */
  const availableAfterObligations =
    totalBalance - upcomingObligations;

  /*
   * Money that can reasonably be considered available
   * after accounting for expected normal spending.
   */
  const safeRoom =
    availableAfterObligations - expectedSpending;

  /*
   * Money remaining after the requested purchase.
   */
  const remainingAfterPurchase =
    safeRoom - purchaseAmount;

  /*
   * Goal commitment is considered separately.
   *
   * We do not automatically treat the entire goal target
   * as an obligation. Only the amount that should currently
   * be committed is considered here.
   */
  const remainingAfterGoalCommitment =
    remainingAfterPurchase - goalCommitment;

  const baseForUtilization =
    safeRoom > BigInt(0)
      ? Number(safeRoom)
      : 0;

  const utilizationRate =
    baseForUtilization > 0
      ? Number(
          (
            (Number(purchaseAmount) /
              baseForUtilization) *
            100
          ).toFixed(2),
        )
      : purchaseAmount > BigInt(0)
        ? 100
        : 0;

  const reasons: string[] = [];

  let status: AffordabilityStatus;

  /*
   * Rule 1:
   * The purchase cannot fit after obligations and
   * expected spending.
   */
  if (remainingAfterPurchase < BigInt(0)) {
    status = "NOT_AFFORDABLE";

    reasons.push(
      "Pembelian akan membuat ruang keuangan menjadi negatif setelah memperhitungkan kewajiban dan pengeluaran yang diperkirakan.",
    );
  } else {
    /*
     * Rule 2:
     * Purchase consumes more than 80% of safe room.
     */
    if (utilizationRate >= 80) {
      status = "RISKY";

      reasons.push(
        "Pembelian menggunakan sebagian besar ruang keuangan yang tersedia.",
      );
    }
    /*
     * Rule 3:
     * Purchase consumes 50%–79.99% of safe room.
     */
    else if (utilizationRate >= 50) {
      status = "CAUTION";

      reasons.push(
        "Pembelian masih memungkinkan, tetapi cukup mengurangi ruang keuangan.",
      );
    }
    /*
     * Rule 4:
     * Purchase is relatively small compared with
     * available safe room.
     */
    else {
      status = "SAFE";

      reasons.push(
        "Pembelian masih berada dalam ruang keuangan yang tersedia setelah memperhitungkan kewajiban dan pengeluaran.",
      );
    }
  }

  /*
   * Goal-specific warning.
   *
   * The purchase may technically be affordable but
   * could interfere with an active financial goal.
   */
  if (
    goalCommitment > BigInt(0) &&
    remainingAfterGoalCommitment < BigInt(0)
  ) {
    if (status === "SAFE") {
      status = "CAUTION";
    }

    reasons.push(
      "Pembelian dapat mengurangi kemampuan memenuhi komitmen financial goal.",
    );
  }

  /*
   * Negative available money is an additional warning.
   */
  if (availableAfterObligations < BigInt(0)) {
    status = "NOT_AFFORDABLE";

    reasons.push(
      "Kewajiban yang akan datang sudah melebihi saldo saat ini.",
    );
  }

  return {
    status,

    totalBalance,

    upcomingObligations,

    expectedSpending,

    goalCommitment,

    purchaseAmount,

    availableAfterObligations,

    safeRoom,

    remainingAfterPurchase,

    remainingAfterGoalCommitment,

    utilizationRate,

    reasons,
  };
}