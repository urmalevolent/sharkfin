export type AIContextUser = {
  name: string;
};

export type AIContextCashflow = {
  income: number;
  expense: number;
  netCashflow: number;
  savingRate: number | null;
};

export type AIContextSpendingCategory = {
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
};

export type AIContextSpending = {
  total: number;
  averageDaily: number;
  transactionCount: number;

  topCategories: AIContextSpendingCategory[];

  trend: {
    current: number;
    previous: number;
    changePercentage: number | null;
    direction:
      | "NO_DATA"
      | "UP"
      | "DOWN"
      | "UNCHANGED";
  };
};

export type AIContextBudget = {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetCount: number;

  highestUsage: {
    categoryId: string;
    categoryName: string;
    usage: number;
    status:
      | "NORMAL"
      | "WATCH"
      | "WARNING"
      | "EXCEEDED";
  } | null;

  budgets: Array<{
    categoryName: string;
    budgetAmount: number;
    spent: number;
    remaining: number;
    usage: number;
    status:
      | "NORMAL"
      | "WATCH"
      | "WARNING"
      | "EXCEEDED";
  }>;
};

export type AIContextGoal = {
  name: string;
  currentAmount: number;
  targetAmount: number;
  remaining: number;
  progress: number;
  deadline: string | null;
  requiredMonthlySaving: number;
  completed: boolean;
};

export type AIContextObligation = {
  name: string;
  amount: number;
  nextDate: string;
};

export type AIContextObligations = {
  totalUpcoming: number;
  availableBalance: number;
  obligationCount: number;
  upcoming: AIContextObligation[];
};

export type AIContextForecast = {
  currentBalance: number;
  upcomingObligations: number;
  availableBalance: number;
  spending: number;
  elapsedDays: number;
  remainingDays: number;
  averageDailySpending: number;
  projectedRemainingSpending: number;
  estimatedEndBalance: number;
};

export type AIContextHealthStatus =
  | "GOOD"
  | "WATCH"
  | "WARNING";

export type AIContextFinancialHealth = {
  overallStatus: AIContextHealthStatus;

  cashflow: {
    income: number;
    expense: number;
    netCashflow: number;
    savingRate: number | null;
    status: AIContextHealthStatus;
  };

  saving: {
    savingRate: number | null;
    status: AIContextHealthStatus;
  };

  budget: {
    budgetCount: number;
    highestUsage: {
      categoryId: string;
      usage: number;
      status: AIContextHealthStatus;
    } | null;
    status: AIContextHealthStatus;
  };

  goals: {
    totalGoals: number;
    goalsNeedingAttention: number;
    status: AIContextHealthStatus;
  };

  obligations: {
    totalUpcoming: number;
    availableBalance: number;
    status: AIContextHealthStatus;
  };
};

export type AIContextInsight = {
  type: string;

  severity:
    | "INFO"
    | "WARNING"
    | "CRITICAL";

  title: string;
  message: string;
  priority: number;
};

export type AIContext = {
  generatedAt: string;

  user: AIContextUser;

  balance: {
    total: number;
  };

  cashflow: AIContextCashflow;

  spending: AIContextSpending;

  budget: AIContextBudget;

  goals: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    goals: AIContextGoal[];
  };

  obligations: AIContextObligations;

  forecast: AIContextForecast;

  financialHealth: AIContextFinancialHealth;

  insights: AIContextInsight[];
};