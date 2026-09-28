/**
 * ETI rules as data. Source: SARS ETI page, amounts effective 1 April 2025.
 * https://www.sars.gov.za/types-of-tax/pay-as-you-earn/employment-tax-incentive-eti/
 *
 * OWNER: role A. If SARS changes the amounts, change THIS FILE ONLY and
 * update the tests. Never put tax maths in an LLM prompt.
 */
export const ETI_RULES = {
  effectiveFrom: "2025-04-01",
  endsOn: "2029-02-28",
  minAge: 18,
  maxAge: 29,
  maxMonths: 24,
  standardHours: 160,
  /** Remuneration at or above this gets no ETI. */
  upperLimit: 7500,
  bands: [
    // [from, to) — first 12 months / second 12 months
    { from: 0, to: 2500, first: (r: number) => 0.6 * r, second: (r: number) => 0.3 * r },
    { from: 2500, to: 5500, first: () => 1500, second: () => 750 },
    {
      from: 5500,
      to: 7500,
      first: (r: number) => 1500 - 0.75 * (r - 5500),
      second: (r: number) => 750 - 0.375 * (r - 5500),
    },
  ],
} as const;
