import type { Guest } from "@/types/guest";

const STORAGE_KEY = "wedding-planner-guests";

export function loadGuests(): Guest[] {
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

    return parsed as Guest[];
  } catch {
    return [];
  }
}

export function saveGuests(guests: Guest[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
}
