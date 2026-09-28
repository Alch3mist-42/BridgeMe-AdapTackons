import { describe, expect, it } from "vitest";
import { buildPlacementPack } from "./index";

describe("buildPlacementPack", () => {
  it("includes ETI amount and checklist", () => {
    const pack = buildPlacementPack({
      businessName: "Mama Joy's Bakery", youthName: "Thandi", placementTitle: "Bakery assistant", startDate: "2026-10-01",
      eti: { dateOfBirth: "2004-03-15", claimMonth: "2026-10", monthlyRemuneration: 4000, hoursPaid: 160, monthsAlreadyClaimed: 0, minimumHourlyWage: 0 },
    });
    expect(pack.etiSummary.monthlyAmount).toBe(1500);
    expect(pack.checklist.some((c) => c.label.includes("UIF"))).toBe(true);
  });
});
