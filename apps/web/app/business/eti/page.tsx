"use client";

import { useEffect, useState } from "react";

// TEMP: fake placements until Oats's lib/demo-data.ts / Prisma land
const fakePlacements = [
  {
    id: "p1",
    youthName: "Thandi M.",
    role: "Kitchen & Admin Assistant",
    dateOfBirth: "2004-03-12",
    claimMonth: "2026-09",
    monthlyRemuneration: 4500,
    hoursPaid: 160,
    monthsAlreadyClaimed: 2,
    minimumHourlyWage: 27.58,
  },
  {
    id: "p2",
    youthName: "Sipho N.",
    role: "Social Media Intern",
    dateOfBirth: "2003-07-20",
    claimMonth: "2026-09",
    monthlyRemuneration: 4200,
    hoursPaid: 150,
    monthsAlreadyClaimed: 0,
    minimumHourlyWage: 27.58,
  },
];

type EtiRow = {
  id: string;
  youthName: string;
  role: string;
  eligible: boolean;
  amount: number;
  reasonText: string[];
};

export default function EtiDashboardPage() {
  const [rows, setRows] = useState<EtiRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      const results = await Promise.all(
        fakePlacements.map(async (p) => {
          const res = await fetch("/api/eti", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
          });
          const data = await res.json();
          return {
            id: p.id,
            youthName: p.youthName,
            role: p.role,
            eligible: data.eligible,
            amount: data.amount,
            reasonText: data.reasonText ?? [],
          };
        })
      );
      setRows(results);
      setLoading(false);
    }
    loadAll();
  }, []);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  if (loading) return <main className="p-4">Loading...</main>;

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">ETI savings</h1>
      <p className="text-sm text-gray-600">
        Employment Tax Incentive, calculated automatically from your placements.
      </p>

      <div className="rounded-2xl bg-emerald-50 p-4">
        <p className="text-sm text-emerald-700">Total this month</p>
        <p className="text-2xl font-semibold text-emerald-800">
          R{total.toLocaleString("en-ZA")}
        </p>
      </div>

      {rows.map((r) => (
        <article
          key={r.id}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{r.youthName}</h3>
              <p className="text-sm text-gray-600">{r.role}</p>
            </div>
            <span
              className={
                r.eligible
                  ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
              }
            >
              {r.eligible ? `R${r.amount.toLocaleString("en-ZA")}/mo` : "Not eligible"}
            </span>
          </div>
          {!r.eligible && r.reasonText.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">{r.reasonText.join(" ")}</p>
          )}
        </article>
      ))}
    </main>
  );
}