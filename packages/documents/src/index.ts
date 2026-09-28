/**
 * Document pack (role A). Monday: build the data layer (this file).
 * Wednesday: render to PDF with @react-pdf/renderer.
 */
import { calculateEti, REASON_TEXT, type EtiInput } from "@ob/incentives";

export interface PackInput {
  businessName: string;
  youthName: string;
  placementTitle: string;
  startDate: string;
  eti: EtiInput;
}

export interface PackChecklistItem { label: string; done: boolean }

export interface PlacementPack {
  title: string;
  etiSummary: { eligible: boolean; monthlyAmount: number; explanation: string[] };
  checklist: PackChecklistItem[];
  disclaimer: string;
}

export function buildPlacementPack(input: PackInput): PlacementPack {
  const r = calculateEti(input.eti);
  return {
    title: `${input.placementTitle}: ${input.youthName} at ${input.businessName}`,
    etiSummary: {
      eligible: r.eligible,
      monthlyAmount: r.amount,
      explanation: r.eligible
        ? [`Estimated ETI this month: R${r.amount.toFixed(2)} (${r.period === "first_12" ? "first" : "second"} 12 months).`,
           "Claim it on your monthly EMP201 by reducing PAYE owed."]
        : r.reasons.map((code) => REASON_TEXT[code]),
    },
    checklist: [
      { label: "Signed fixed-term contract", done: false },
      { label: "Employee registered for UIF (uFiling)", done: false },
      { label: "Employee added to payroll with ETI flag", done: false },
      { label: "POPIA consent recorded on the platform", done: false },
      { label: "Weekly timesheets signed off (evidence ledger)", done: false },
    ],
    disclaimer: "Estimate only, based on SARS ETI rules effective 1 April 2025. Confirm with your payroll provider or tax practitioner.",
  };
}
