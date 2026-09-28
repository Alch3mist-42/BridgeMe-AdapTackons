import { ETI_RULES } from "./rules";
import { ageOn } from "./sa-id";

export interface EtiInput {
  /** YYYY-MM-DD, derived from the SA ID. */
  dateOfBirth: string;
  /** Claim month as YYYY-MM. */
  claimMonth: string;
  /** Gross monthly remuneration in rand. */
  monthlyRemuneration: number;
  /** Hours employed AND paid this month. */
  hoursPaid: number;
  /** How many months ETI has already been claimed for this employee (any employer). */
  monthsAlreadyClaimed: number;
  /** Rand per hour required by the applicable minimum wage (national minimum wage or sectoral). */
  minimumHourlyWage: number;
  isConnectedPerson?: boolean;
  isDomesticWorker?: boolean;
  /** Employer registered for PAYE, tax compliant, not a public entity. */
  employerEligible?: boolean;
}

export type EtiReason =
  | "UNDER_AGE"
  | "OVER_AGE"
  | "MAX_MONTHS_REACHED"
  | "EARNS_TOO_MUCH"
  | "BELOW_MINIMUM_WAGE"
  | "CONNECTED_PERSON"
  | "DOMESTIC_WORKER"
  | "EMPLOYER_NOT_ELIGIBLE"
  | "OUTSIDE_SCHEME_DATES"
  | "NO_HOURS";

export interface EtiResult {
  eligible: boolean;
  reasons: EtiReason[];
  /** Rand, rounded to cents. 0 when not eligible. */
  amount: number;
  period: "first_12" | "second_12" | null;
  ageAtMonthEnd: number;
  /** Remuneration after grossing up to 160 hours, used to pick the band. */
  bandRemuneration: number;
}

function lastDayOfMonth(claimMonth: string): string {
  const [y, m] = claimMonth.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Monthly ETI for one employee. Pure and deterministic: same input, same output.
 * Age is tested at the END of the claim month (SARS guide).
 * Under 160 paid hours: remuneration is grossed up to 160 hours to find the band,
 * then the incentive is scaled by hours / 160.
 */
export function calculateEti(input: EtiInput): EtiResult {
  const R = ETI_RULES;
  const reasons: EtiReason[] = [];
  const monthEnd = lastDayOfMonth(input.claimMonth);
  const age = ageOn(input.dateOfBirth, monthEnd);

  if (monthEnd < R.effectiveFrom || input.claimMonth > R.endsOn.slice(0, 7)) reasons.push("OUTSIDE_SCHEME_DATES");
  if (age < R.minAge) reasons.push("UNDER_AGE");
  if (age > R.maxAge) reasons.push("OVER_AGE");
  if (input.monthsAlreadyClaimed >= R.maxMonths) reasons.push("MAX_MONTHS_REACHED");
  if (input.isConnectedPerson) reasons.push("CONNECTED_PERSON");
  if (input.isDomesticWorker) reasons.push("DOMESTIC_WORKER");
  if (input.employerEligible === false) reasons.push("EMPLOYER_NOT_ELIGIBLE");
  if (input.hoursPaid <= 0) reasons.push("NO_HOURS");

  const hours = Math.max(input.hoursPaid, 0);
  const scale = hours > 0 && hours < R.standardHours ? hours / R.standardHours : 1;
  const bandRemuneration = hours > 0 ? input.monthlyRemuneration / scale : 0;

  if (bandRemuneration >= R.upperLimit) reasons.push("EARNS_TOO_MUCH");
  if (hours > 0) {
    const hourly = input.monthlyRemuneration / hours;
    if (hourly < input.minimumHourlyWage) reasons.push("BELOW_MINIMUM_WAGE");
  }

  const period = input.monthsAlreadyClaimed < 12 ? "first_12" : "second_12";
  if (reasons.length > 0) {
    return { eligible: false, reasons, amount: 0, period: null, ageAtMonthEnd: age, bandRemuneration: round2(bandRemuneration) };
  }

  const band = R.bands.find((b) => bandRemuneration >= b.from && bandRemuneration < b.to)!;
  const full = period === "first_12" ? band.first(bandRemuneration) : band.second(bandRemuneration);
  return {
    eligible: true,
    reasons,
    amount: round2(Math.max(full, 0) * scale),
    period,
    ageAtMonthEnd: age,
    bandRemuneration: round2(bandRemuneration),
  };
}

/** Plain-language explanation for the SME dashboard. */
export const REASON_TEXT: Record<EtiReason, string> = {
  UNDER_AGE: "Employee is under 18 at the end of the month.",
  OVER_AGE: "Employee is over 29 at the end of the month.",
  MAX_MONTHS_REACHED: "ETI has already been claimed for 24 months for this employee.",
  EARNS_TOO_MUCH: "Pay is R7,500 or more a month (after adjusting for hours).",
  BELOW_MINIMUM_WAGE: "Pay is below the applicable minimum wage.",
  CONNECTED_PERSON: "Employee is connected to the employer (e.g. family).",
  DOMESTIC_WORKER: "Domestic workers do not qualify.",
  EMPLOYER_NOT_ELIGIBLE: "Employer must be PAYE-registered, tax compliant and not a public entity.",
  OUTSIDE_SCHEME_DATES: "Claim month is outside the dates these rules cover.",
  NO_HOURS: "No paid hours recorded for this month.",
};
