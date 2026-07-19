"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadBudgetItems } from "@/lib/budget-storage";
import { formatMoney } from "@/lib/format-money";
import { getBudgetSummary } from "@/types/budget";

export default function BudgetSummary() {
  const [totals, setTotals] = useState({
    totalEstimated: 0,
    totalActual: 0,
    balanceRemaining: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const summary = getBudgetSummary(loadBudgetItems());
    setTotals({
      totalEstimated: summary.totalEstimated,
      totalActual: summary.totalActual,
      balanceRemaining: summary.balanceRemaining,
    });
    setIsLoaded(true);
  }, []);

  return (
    <section className="mt-10 rounded-xl bg-white p-6 text-left shadow-sm ring-1 ring-rose-100">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-rose-400">
          Budget snapshot
        </h2>
        <Link
          href="/budget"
          className="text-sm font-medium text-rose-600 hover:text-rose-800"
        >
          View budget
        </Link>
      </div>

      {!isLoaded ? (
        <p className="mt-4 text-sm text-zinc-500">Loading...</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-zinc-500">Budgeted</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {formatMoney(totals.totalEstimated)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Spent</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {formatMoney(totals.totalActual)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Remaining</p>
            <p
              className={`mt-1 text-2xl font-semibold ${
                totals.balanceRemaining < 0 ? "text-red-600" : "text-zinc-900"
              }`}
            >
              {formatMoney(totals.balanceRemaining)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
