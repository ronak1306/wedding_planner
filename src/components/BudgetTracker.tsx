"use client";

import { useEffect, useState } from "react";
import { loadBudgetItems, saveBudgetItems } from "@/lib/budget-storage";
import { formatMoney } from "@/lib/format-money";
import type { BudgetFormData, BudgetItem } from "@/types/budget";
import {
  SUGGESTED_CATEGORIES,
  SUGGESTED_PAYERS,
  emptyBudgetForm,
  getBudgetSummary,
} from "@/types/budget";

function parseMoneyInput(value: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function formatDueDate(dueDate: string): string {
  if (!dueDate) {
    return "—";
  }

  const date = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }

  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BudgetTracker() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [formData, setFormData] = useState<BudgetFormData>(emptyBudgetForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadBudgetItems());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveBudgetItems(items);
    }
  }, [items, isLoaded]);

  const summary = getBudgetSummary(items);
  const isEditing = editingId !== null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    const cleaned: BudgetFormData = {
      ...formData,
      name: formData.name.trim(),
      paidBy: formData.paidBy.trim() || "Couple",
    };

    if (isEditing) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId ? { ...item, ...cleaned } : item,
        ),
      );
      setEditingId(null);
    } else {
      const newItem: BudgetItem = {
        id: crypto.randomUUID(),
        ...cleaned,
      };
      setItems((current) => [...current, newItem]);
    }

    setFormData(emptyBudgetForm());
  }

  function handleEdit(item: BudgetItem) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      depositPaid: item.depositPaid,
      dueDate: item.dueDate,
      paidBy: item.paidBy,
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this budget category?")) {
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyBudgetForm());
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(emptyBudgetForm());
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900">Budget Tracker</h1>
        <p className="mt-2 text-zinc-600">
          Track estimated vs actual costs, deposits, and who is paying.
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total estimated", value: summary.totalEstimated },
          { label: "Total actual", value: summary.totalActual },
          { label: "Deposits paid", value: summary.totalDeposits },
          {
            label: "Balance remaining",
            value: summary.balanceRemaining,
            highlight: summary.balanceRemaining < 0,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-rose-100"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p
              className={`mt-1 text-3xl font-bold ${
                card.highlight ? "text-red-600" : "text-rose-900"
              }`}
            >
              {formatMoney(card.value)}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
        <h2 className="text-lg font-semibold text-zinc-900">
          {isEditing ? "Edit category" : "Add a category"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-zinc-700">
              Category name
            </span>
            <input
              type="text"
              required
              list="budget-category-suggestions"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="Venue, catering, or your own category"
            />
            <datalist id="budget-category-suggestions">
              {SUGGESTED_CATEGORIES.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Estimated cost
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.estimatedCost}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  estimatedCost: parseMoneyInput(event.target.value),
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Actual cost
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.actualCost}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  actualCost: parseMoneyInput(event.target.value),
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Deposit paid
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.depositPaid}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  depositPaid: parseMoneyInput(event.target.value),
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Due date
            </span>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(event) =>
                setFormData({ ...formData, dueDate: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-zinc-700">
              Who&apos;s paying
            </span>
            <select
              value={
                (SUGGESTED_PAYERS as readonly string[]).includes(formData.paidBy)
                  ? formData.paidBy
                  : "__custom__"
              }
              onChange={(event) => {
                const value = event.target.value;
                if (value === "__custom__") {
                  setFormData({ ...formData, paidBy: "" });
                  return;
                }
                setFormData({ ...formData, paidBy: value });
              }}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              {SUGGESTED_PAYERS.map((payer) => (
                <option key={payer} value={payer}>
                  {payer}
                </option>
              ))}
              <option value="__custom__">Other (custom)</option>
            </select>
            {!(SUGGESTED_PAYERS as readonly string[]).includes(formData.paidBy) && (
              <input
                type="text"
                value={formData.paidBy}
                onChange={(event) =>
                  setFormData({ ...formData, paidBy: event.target.value })
                }
                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                placeholder="Type a custom payer name"
              />
            )}
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              {isEditing ? "Save changes" : "Add category"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-rose-100">
        {!isLoaded ? (
          <p className="p-6 text-zinc-500">Loading budget...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-zinc-500">
            No categories yet. Add your first budget item using the form above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-rose-100 bg-rose-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Estimated</th>
                  <th className="px-4 py-3 font-medium">Actual</th>
                  <th className="px-4 py-3 font-medium">Deposit</th>
                  <th className="px-4 py-3 font-medium">Due date</th>
                  <th className="px-4 py-3 font-medium">Paid by</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {items.map((item) => {
                  const isOverBudget = item.actualCost > item.estimatedCost;

                  return (
                    <tr
                      key={item.id}
                      className={
                        isOverBudget
                          ? "bg-red-50 text-red-900"
                          : "text-zinc-800"
                      }
                    >
                      <td className="px-4 py-3 font-medium">
                        {item.name}
                        {isOverBudget && (
                          <span className="ml-2 text-xs font-medium text-red-600">
                            Over budget
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatMoney(item.estimatedCost)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatMoney(item.actualCost)}
                      </td>
                      <td className="px-4 py-3">
                        {formatMoney(item.depositPaid)}
                      </td>
                      <td className="px-4 py-3">
                        {formatDueDate(item.dueDate)}
                      </td>
                      <td className="px-4 py-3">{item.paidBy || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className={
                              isOverBudget
                                ? "text-red-700 hover:text-red-900"
                                : "text-rose-600 hover:text-rose-800"
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className={
                              isOverBudget
                                ? "text-red-500 hover:text-red-800"
                                : "text-zinc-500 hover:text-red-600"
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
