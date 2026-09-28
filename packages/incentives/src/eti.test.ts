import { describe, expect, it } from "vitest";
import { calculateEti, parseSaId, ageOn } from "./index";

/** Build a valid SA ID for tests by computing the Luhn check digit. */
function makeId(yymmdd: string, seq = "5000", citizen = "0"): string {
  const body = `${yymmdd}${seq}${citizen}8`;
  for (let z = 0; z <= 9; z++) {
    const id = body + z;
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      let d = Number(id[12 - i]);
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    if (sum % 10 === 0) return id;
  }
  throw new Error("unreachable");
}

const TODAY = new Date("2026-09-27T00:00:00Z");
const base = {
  dateOfBirth: "2004-03-15", // 22 in 2026
  claimMonth: "2026-10",
  hoursPaid: 160,
  monthsAlreadyClaimed: 0,
  minimumHourlyWage: 0,
};

describe("parseSaId", () => {
  it("parses a valid 2000s ID", () => {
    const r = parseSaId(makeId("040315"), TODAY);
    expect(r).toMatchObject({ valid: true, dateOfBirth: "2004-03-15", gender: "male", citizenship: "citizen" });
  });
  it("puts a future YY in the 1900s", () => {
    const r = parseSaId(makeId("950101", "0001"), TODAY);
    expect(r).toMatchObject({ valid: true, dateOfBirth: "1995-01-01", gender: "female" });
  });
  it("rejects a bad checksum", () => {
    const good = makeId("040315");
    const bad = good.slice(0, 12) + ((Number(good[12]) + 1) % 10);
    expect(parseSaId(bad, TODAY)).toMatchObject({ valid: false });
  });
  it("rejects an impossible date", () => {
    expect(parseSaId(makeId("040231"), TODAY)).toMatchObject({ valid: false, reason: expect.stringMatching(/date/) });
  });
  it("rejects wrong length and letters", () => {
    expect(parseSaId("12345", TODAY).valid).toBe(false);
    expect(parseSaId("04031550000A8", TODAY).valid).toBe(false);
  });
  it("reads refugee citizenship digit", () => {
    expect(parseSaId(makeId("040315", "5000", "2"), TODAY)).toMatchObject({ citizenship: "refugee" });
  });
});

describe("ageOn", () => {
  it("counts birthdays correctly", () => {
    expect(ageOn("2004-10-31", "2026-10-30")).toBe(21);
    expect(ageOn("2004-10-31", "2026-10-31")).toBe(22);
  });
});

describe("calculateEti — bands (first 12 months)", () => {
  it("R2,000 → 60% = R1,200", () => {
    expect(calculateEti({ ...base, monthlyRemuneration: 2000 }).amount).toBe(1200);
  });
  it("R4,000 → flat R1,500", () => {
    expect(calculateEti({ ...base, monthlyRemuneration: 4000 }).amount).toBe(1500);
  });
  it("R6,500 → 1500 − 0.75×1000 = R750", () => {
    expect(calculateEti({ ...base, monthlyRemuneration: 6500 }).amount).toBe(750);
  });
  it("R7,500 or more → not eligible", () => {
    const r = calculateEti({ ...base, monthlyRemuneration: 7500 });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain("EARNS_TOO_MUCH");
  });
});

describe("calculateEti — second 12 months", () => {
  it("R4,000 in month 13 → R750", () => {
    const r = calculateEti({ ...base, monthlyRemuneration: 4000, monthsAlreadyClaimed: 12 });
    expect(r).toMatchObject({ amount: 750, period: "second_12" });
  });
  it("R6,500 in month 13 → 750 − 0.375×1000 = R375", () => {
    expect(calculateEti({ ...base, monthlyRemuneration: 6500, monthsAlreadyClaimed: 12 }).amount).toBe(375);
  });
  it("stops after 24 months", () => {
    expect(calculateEti({ ...base, monthlyRemuneration: 4000, monthsAlreadyClaimed: 24 }).reasons).toContain("MAX_MONTHS_REACHED");
  });
});

describe("calculateEti — hours pro-rating", () => {
  it("80 hours at R2,000 → grossed up to R4,000 band, half of R1,500", () => {
    const r = calculateEti({ ...base, monthlyRemuneration: 2000, hoursPaid: 80 });
    expect(r.bandRemuneration).toBe(4000);
    expect(r.amount).toBe(750);
  });
  it("part-timer grossed up past R7,500 gets nothing", () => {
    expect(calculateEti({ ...base, monthlyRemuneration: 4000, hoursPaid: 80 }).reasons).toContain("EARNS_TOO_MUCH");
  });
  it("zero hours is not eligible", () => {
    expect(calculateEti({ ...base, monthlyRemuneration: 4000, hoursPaid: 0 }).reasons).toContain("NO_HOURS");
  });
});

describe("calculateEti — age at END of claim month", () => {
  it("turns 30 during the month → not eligible", () => {
    const r = calculateEti({ ...base, dateOfBirth: "1996-10-10", monthlyRemuneration: 4000 });
    expect(r.reasons).toContain("OVER_AGE");
  });
  it("turns 18 during the month → eligible", () => {
    const r = calculateEti({ ...base, dateOfBirth: "2008-10-31", monthlyRemuneration: 4000 });
    expect(r.eligible).toBe(true);
  });
  it("17 at month end → not eligible", () => {
    expect(calculateEti({ ...base, dateOfBirth: "2008-11-01", monthlyRemuneration: 4000 }).reasons).toContain("UNDER_AGE");
  });
});

describe("calculateEti — exclusions", () => {
  it("connected person, domestic worker, ineligible employer", () => {
    const r = calculateEti({ ...base, monthlyRemuneration: 4000, isConnectedPerson: true, isDomesticWorker: true, employerEligible: false });
    expect(r.reasons).toEqual(expect.arrayContaining(["CONNECTED_PERSON", "DOMESTIC_WORKER", "EMPLOYER_NOT_ELIGIBLE"]));
    expect(r.amount).toBe(0);
  });
  it("below the minimum hourly wage", () => {
    const r = calculateEti({ ...base, monthlyRemuneration: 3000, minimumHourlyWage: 28.79 });
    expect(r.reasons).toContain("BELOW_MINIMUM_WAGE");
  });
  it("after the scheme end date", () => {
    expect(calculateEti({ ...base, claimMonth: "2029-03", monthlyRemuneration: 4000 }).reasons).toContain("OUTSIDE_SCHEME_DATES");
  });
});
