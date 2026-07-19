"use client";

import { useEffect, useState } from "react";
import { loadGuests, saveGuests } from "@/lib/guests-storage";
import type { Guest, GuestFormData, RsvpStatus } from "@/types/guest";
import {
  MEAL_CHOICES,
  RSVP_STATUSES,
  emptyGuestForm,
} from "@/types/guest";

function formatLabel(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

function getSummary(guests: Guest[]) {
  return {
    total: guests.length,
    confirmed: guests.filter((guest) => guest.rsvpStatus === "confirmed")
      .length,
    declined: guests.filter((guest) => guest.rsvpStatus === "declined").length,
    pending: guests.filter((guest) => guest.rsvpStatus === "pending").length,
  };
}

function rsvpBadgeClass(status: RsvpStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "declined":
      return "bg-red-100 text-red-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [formData, setFormData] = useState<GuestFormData>(emptyGuestForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setGuests(loadGuests());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveGuests(guests);
    }
  }, [guests, isLoaded]);

  const summary = getSummary(guests);
  const isEditing = editingId !== null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    if (isEditing) {
      setGuests((current) =>
        current.map((guest) =>
          guest.id === editingId ? { ...guest, ...formData } : guest,
        ),
      );
      setEditingId(null);
    } else {
      const newGuest: Guest = {
        id: crypto.randomUUID(),
        ...formData,
        name: formData.name.trim(),
        household: formData.household.trim(),
        dietaryNotes: formData.dietaryNotes.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };
      setGuests((current) => [...current, newGuest]);
    }

    setFormData(emptyGuestForm());
  }

  function handleEdit(guest: Guest) {
    setEditingId(guest.id);
    setFormData({
      name: guest.name,
      household: guest.household,
      plusOne: guest.plusOne,
      rsvpStatus: guest.rsvpStatus,
      mealChoice: guest.mealChoice,
      dietaryNotes: guest.dietaryNotes,
      phoneNumber: guest.phoneNumber,
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this guest from the list?")) {
      return;
    }

    setGuests((current) => current.filter((guest) => guest.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyGuestForm());
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(emptyGuestForm());
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900">Guest List</h1>
        <p className="mt-2 text-zinc-600">
          Track RSVPs, meal choices, and dietary notes for your wedding.
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total invited", value: summary.total },
          { label: "Confirmed", value: summary.confirmed },
          { label: "Declined", value: summary.declined },
          { label: "Pending", value: summary.pending },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-rose-100"
          >
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className="mt-1 text-3xl font-bold text-rose-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
        <h2 className="text-lg font-semibold text-zinc-900">
          {isEditing ? "Edit guest" : "Add a guest"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Name</span>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="Jane Smith"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Household / group
            </span>
            <input
              type="text"
              value={formData.household}
              onChange={(event) =>
                setFormData({ ...formData, household: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="Smith Family"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Phone number
            </span>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(event) =>
                setFormData({ ...formData, phoneNumber: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="0400 000 000"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Plus-one
            </span>
            <select
              value={formData.plusOne ? "yes" : "no"}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  plusOne: event.target.value === "yes",
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              RSVP status
            </span>
            <select
              value={formData.rsvpStatus}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  rsvpStatus: event.target.value as GuestFormData["rsvpStatus"],
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              {RSVP_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Meal choice
            </span>
            <select
              value={formData.mealChoice}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  mealChoice: event.target.value as GuestFormData["mealChoice"],
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              {MEAL_CHOICES.map((choice) => (
                <option key={choice} value={choice}>
                  {formatLabel(choice)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-zinc-700">
              Dietary notes
            </span>
            <textarea
              value={formData.dietaryNotes}
              onChange={(event) =>
                setFormData({ ...formData, dietaryNotes: event.target.value })
              }
              rows={2}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="Allergies, preferences, etc."
            />
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              {isEditing ? "Save changes" : "Add guest"}
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
          <p className="p-6 text-zinc-500">Loading guests...</p>
        ) : guests.length === 0 ? (
          <p className="p-6 text-zinc-500">
            No guests yet. Add your first guest using the form above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-rose-100 bg-rose-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Household</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Plus-one</th>
                  <th className="px-4 py-3 font-medium">RSVP</th>
                  <th className="px-4 py-3 font-medium">Meal</th>
                  <th className="px-4 py-3 font-medium">Dietary notes</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {guests.map((guest) => (
                  <tr key={guest.id} className="text-zinc-800">
                    <td className="px-4 py-3 font-medium">{guest.name}</td>
                    <td className="px-4 py-3">{guest.household || "—"}</td>
                    <td className="px-4 py-3">{guest.phoneNumber || "—"}</td>
                    <td className="px-4 py-3">{guest.plusOne ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${rsvpBadgeClass(guest.rsvpStatus)}`}
                      >
                        {formatLabel(guest.rsvpStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatLabel(guest.mealChoice)}</td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {guest.dietaryNotes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(guest)}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(guest.id)}
                          className="text-zinc-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
