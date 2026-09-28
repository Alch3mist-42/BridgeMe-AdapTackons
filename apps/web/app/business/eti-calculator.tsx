"use client";

import { useMemo, useState } from "react";
import { calculateEti, REASON_TEXT } from "@ob/incentives";

const field = "w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700";

export function EtiCalculator() {
  const [pay, setPay] = useState(4000);
  const [hours, setHours] = useState(160);
  const [dob, setDob] = useState("2004-03-15");
  const [months, setMonths] = useState(0);
  const claimMonth = new Date().toISOString().slice(0, 7);

  const r = useMemo(
    () => calculateEti({ dateOfBirth: dob, claimMonth, monthlyRemuneration: pay, hoursPaid: hours, monthsAlreadyClaimed: months, minimumHourlyWage: 0 }),
    [pay, hours, dob, months, claimMonth],
  );
  const net = Math.max(pay - r.amount, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <label className="block space-y-1"><span className="text-sm">Monthly pay (R)</span>
          <input className={field} type="number" min={0} value={pay} onChange={(e) => setPay(Number(e.target.value))} /></label>
        <label className="block space-y-1"><span className="text-sm">Paid hours this month</span>
          <input className={field} type="number" min={0} value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
        <label className="block space-y-1"><span className="text-sm">Employee date of birth</span>
          <input className={field} type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></label>
        <label className="block space-y-1"><span className="text-sm">Months of ETI already claimed</span>
          <input className={field} type="number" min={0} max={24} value={months} onChange={(e) => setMonths(Number(e.target.value))} /></label>
      </form>
      <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
        {r.eligible ? (
          <>
            <p className="text-sm text-slate-500">Estimated ETI this month</p>
            <p className="text-4xl font-bold text-emerald-600">R{r.amount.toFixed(2)}</p>
            <p className="mt-4 text-sm">Your real cost: <strong>R{net.toFixed(2)}</strong> of R{pay.toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-500">Claimed on your EMP201 by reducing PAYE. No application needed.</p>
          </>
        ) : (
          <>
            <p className="font-semibold">Not eligible this month</p>
            <ul className="mt-2 list-disc pl-5 text-sm">{r.reasons.map((c) => <li key={c}>{REASON_TEXT[c]}</li>)}</ul>
          </>
        )}
        <p className="mt-6 text-xs text-slate-500">Estimate only, based on SARS rules effective 1 April 2025.</p>
      </div>
    </div>
  );
}
