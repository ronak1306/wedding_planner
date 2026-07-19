export type BudgetItem = {
  id: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
  depositPaid: number;
  dueDate: string;
  paidBy: string;
};

export type BudgetFormData = Omit<BudgetItem, "id">;

export type BudgetSummaryTotals = {
  totalEstimated: number;
  totalActual: number;
  totalDeposits: number;
  balanceRemaining: number;
};

export const SUGGESTED_CATEGORIES = [
  "Venue",
  "Catering",
  "Attire",
  "Photography",
  "Florals",
  "Music / DJ",
  "Decor",
  "Transport",
] as const;

export const SUGGESTED_PAYERS = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "Both Families",
] as const;

export const emptyBudgetForm = (): BudgetFormData => ({
  name: "",
  estimatedCost: 0,
  actualCost: 0,
  depositPaid: 0,
  dueDate: "",
  paidBy: "Couple",
});

export function getBudgetSummary(items: BudgetItem[]): BudgetSummaryTotals {
  const totalEstimated = items.reduce(
    (sum, item) => sum + item.estimatedCost,
    0,
  );
  const totalActual = items.reduce((sum, item) => sum + item.actualCost, 0);
  const totalDeposits = items.reduce((sum, item) => sum + item.depositPaid, 0);

  return {
    totalEstimated,
    totalActual,
    totalDeposits,
    balanceRemaining: totalEstimated - totalActual,
  };
}
