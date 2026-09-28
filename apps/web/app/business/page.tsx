import { EtiCalculator } from "./eti-calculator";

// OWNER: role C — SME onboarding, placements, timesheet sign-off.
// The calculator below is role A's engine, live from day one.
export default function BusinessHome() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">What would a youth placement cost you?</h1>
        <p className="text-slate-600 dark:text-slate-400">Estimate your monthly Employment Tax Incentive. No sign-up needed.</p>
      </div>
      <EtiCalculator />
    </section>
  );
}
