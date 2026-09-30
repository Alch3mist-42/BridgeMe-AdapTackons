"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIERS = [
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "ID_VERIFIED", label: "ID verified (informal)" },
  { value: "CIPC_VERIFIED", label: "CIPC verified (registered)" },
] as const;

export function VerifyControls({
  id,
  tier,
}: {
  id: string;
  tier: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(next: string) {
    setBusy(true);
    setError("");

    const res = await fetch(`/api/admin/businesses/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: next }),
    });

    if (!res.ok) {
      setError("Could not update verification status");
    }

    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <select
        value={tier}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-transparent"
      >
        {TIERS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
