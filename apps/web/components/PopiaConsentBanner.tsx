"use client";

import { useEffect, useState } from "react";

export function PopiaConsentBanner() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkConsent() {
      try {
        const res = await fetch("/api/consent");
        if (res.ok) {
          const data = await res.json();
          setHasConsented(data.consent?.granted ?? false);
        }
      } catch (err) {
        console.error("Failed to fetch consent status", err);
      }
    }
    checkConsent();
  }, []);

  async function handleConsent(granted: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ granted, purpose: "POPIA_GENERAL_PROCESSING" }),
      });
      if (res.ok) {
        setHasConsented(granted);
      }
    } catch (err) {
      alert("Error saving consent preference");
    } finally {
      setLoading(false);
    }
  }

  if (hasConsented === null || hasConsented === true) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            POPIA Data Privacy & Consent Notice
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            In accordance with the Protection of Personal Information Act (POPIA), Opportunity Bridge requires your consent to process your personal profile, skill matches, and application records.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleConsent(false)}
            disabled={loading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Decline
          </button>
          <button
            onClick={() => handleConsent(true)}
            disabled={loading}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Accept & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
