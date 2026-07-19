"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadVendors } from "@/lib/vendors-storage";
import { countBookedVendors } from "@/types/vendor";

export default function VendorSummary() {
  const [bookedCount, setBookedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setBookedCount(countBookedVendors(loadVendors()));
    setIsLoaded(true);
  }, []);

  return (
    <section className="mt-10 rounded-xl bg-white p-6 text-left shadow-sm ring-1 ring-rose-100">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-rose-400">
          Vendors
        </h2>
        <Link
          href="/vendors"
          className="text-sm font-medium text-rose-600 hover:text-rose-800"
        >
          View vendors
        </Link>
      </div>

      {!isLoaded ? (
        <p className="mt-4 text-sm text-zinc-500">Loading...</p>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-zinc-500">Booked</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">
            {bookedCount}{" "}
            <span className="text-base font-normal text-zinc-600">
              {bookedCount === 1 ? "vendor" : "vendors"}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
