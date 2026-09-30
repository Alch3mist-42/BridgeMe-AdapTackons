"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResolveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function resolve() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}/resolve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to resolve report");
      router.refresh();
    } catch (err) {
      alert("Error resolving report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={resolve}
      disabled={loading}
      className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? "Resolving..." : "Mark resolved"}
    </button>
  );
}
