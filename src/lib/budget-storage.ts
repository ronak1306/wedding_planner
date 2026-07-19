import type { BudgetItem } from "@/types/budget";

const STORAGE_KEY = "wedding-planner-budget";

export function loadBudgetItems(): BudgetItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as BudgetItem[];
  } catch {
    return [];
  }
}

export function saveBudgetItems(items: BudgetItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
