"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/format-money";
import { loadVendors, saveVendors } from "@/lib/vendors-storage";
import type { Vendor, VendorFormData, VendorStatus } from "@/types/vendor";
import {
  VENDOR_STATUSES,
  VENDOR_TYPES,
  emptyVendorForm,
} from "@/types/vendor";

function formatLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseMoneyInput(value: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function statusBadgeClass(status: VendorStatus): string {
  switch (status) {
    case "booked":
      return "bg-green-100 text-green-800";
    case "quoted":
      return "bg-blue-100 text-blue-800";
    case "contacted":
      return "bg-amber-100 text-amber-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function isPresetType(type: string): boolean {
  return (VENDOR_TYPES as readonly string[]).includes(type);
}

export default function VendorTracker() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState<VendorFormData>(emptyVendorForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    setVendors(loadVendors());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveVendors(vendors);
    }
  }, [vendors, isLoaded]);

  const isEditing = editingId !== null;
  const usingCustomType = !isPresetType(formData.type);

  const typeOptions = Array.from(
    new Set(
      vendors
        .map((vendor) => vendor.type)
        .filter((type) => !isPresetType(type)),
    ),
  ).sort();

  const filteredVendors = vendors.filter((vendor) => {
    const matchesType = filterType === "all" || vendor.type === filterType;
    const matchesStatus =
      filterStatus === "all" || vendor.status === filterStatus;
    return matchesType && matchesStatus;
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.type.trim()) {
      return;
    }

    const cleaned: VendorFormData = {
      ...formData,
      name: formData.name.trim(),
      type: formData.type.trim().toLowerCase(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      notes: formData.notes.trim(),
    };

    if (isEditing) {
      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === editingId ? { ...vendor, ...cleaned } : vendor,
        ),
      );
      setEditingId(null);
    } else {
      const newVendor: Vendor = {
        id: crypto.randomUUID(),
        ...cleaned,
      };
      setVendors((current) => [...current, newVendor]);
    }

    setFormData(emptyVendorForm());
  }

  function handleEdit(vendor: Vendor) {
    setEditingId(vendor.id);
    setFormData({
      name: vendor.name,
      type: vendor.type,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
      quotedPrice: vendor.quotedPrice,
      status: vendor.status,
      notes: vendor.notes,
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this vendor?")) {
      return;
    }

    setVendors((current) => current.filter((vendor) => vendor.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyVendorForm());
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(emptyVendorForm());
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900">
          Vendors & Venues
        </h1>
        <p className="mt-2 text-zinc-600">
          Track quotes, contacts, and booking status for your wedding vendors.
        </p>
      </header>

      <section className="mb-8 flex flex-wrap gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-rose-100">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">
            Filter by type
          </span>
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            <option value="all">All types</option>
            {VENDOR_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">
            Filter by status
          </span>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            <option value="all">All statuses</option>
            {VENDOR_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
        <h2 className="text-lg font-semibold text-zinc-900">
          {isEditing ? "Edit vendor" : "Add a vendor"}
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
              placeholder="Rosewood Estate"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Type</span>
            <select
              value={usingCustomType ? "__custom__" : formData.type}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "__custom__") {
                  setFormData({ ...formData, type: "" });
                  return;
                }
                setFormData({ ...formData, type: value });
              }}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              {VENDOR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
              <option value="__custom__">Other (custom)</option>
            </select>
            {usingCustomType && (
              <input
                type="text"
                required
                value={formData.type}
                onChange={(event) =>
                  setFormData({ ...formData, type: event.target.value })
                }
                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                placeholder="e.g. makeup artist"
              />
            )}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">
              Contact person
            </span>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(event) =>
                setFormData({ ...formData, contactPerson: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="Sam Lee"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Status</span>
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as VendorStatus,
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              {VENDOR_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Phone</span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) =>
                setFormData({ ...formData, phone: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="0400 000 000"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Email</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="hello@venue.com"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-zinc-700">
              Quoted price
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.quotedPrice}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  quotedPrice: parseMoneyInput(event.target.value),
                })
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-zinc-700">Notes</span>
            <textarea
              value={formData.notes}
              onChange={(event) =>
                setFormData({ ...formData, notes: event.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="Package details, visit dates, etc."
            />
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              {isEditing ? "Save changes" : "Add vendor"}
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

      <section>
        {!isLoaded ? (
          <p className="text-zinc-500">Loading vendors...</p>
        ) : filteredVendors.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-zinc-500 shadow-sm ring-1 ring-rose-100">
            {vendors.length === 0
              ? "No vendors yet. Add your first vendor using the form above."
              : "No vendors match these filters."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <article
                key={vendor.id}
                className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-rose-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {vendor.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {formatLabel(vendor.type)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(vendor.status)}`}
                  >
                    {formatLabel(vendor.status)}
                  </span>
                </div>

                <dl className="mt-4 space-y-2 text-sm text-zinc-700">
                  <div>
                    <dt className="text-zinc-500">Contact</dt>
                    <dd>{vendor.contactPerson || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Phone</dt>
                    <dd>{vendor.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Email</dt>
                    <dd className="break-all">{vendor.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Quoted price</dt>
                    <dd className="font-medium text-zinc-900">
                      {formatMoney(vendor.quotedPrice)}
                    </dd>
                  </div>
                  {vendor.notes && (
                    <div>
                      <dt className="text-zinc-500">Notes</dt>
                      <dd className="line-clamp-3">{vendor.notes}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-auto flex gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => handleEdit(vendor)}
                    className="text-sm font-medium text-rose-600 hover:text-rose-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vendor.id)}
                    className="text-sm font-medium text-zinc-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
