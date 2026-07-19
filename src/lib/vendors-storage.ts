import type { Vendor } from "@/types/vendor";

const STORAGE_KEY = "wedding-planner-vendors";

export function loadVendors(): Vendor[] {
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

    return parsed as Vendor[];
  } catch {
    return [];
  }
}

export function saveVendors(vendors: Vendor[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}
