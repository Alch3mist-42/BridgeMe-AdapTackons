import { describe, expect, it } from "vitest";
import { haversineKm, estimateTravel, rankOpenings, cosine } from "./index";

const braam = { lat: -26.1929, lng: 28.0305 }; // Braamfontein
const soweto = { lat: -26.2485, lng: 27.854 };
const pretoria = { lat: -25.7479, lng: 28.2293 };

describe("haversineKm", () => {
  it("Braamfontein to Pretoria is roughly 53 km", () => {
    expect(haversineKm(braam, pretoria)).toBeGreaterThan(50);
    expect(haversineKm(braam, pretoria)).toBeLessThan(57);
  });
  it("same point is zero", () => expect(haversineKm(braam, braam)).toBe(0));
});

describe("estimateTravel", () => {
  it("walking costs nothing but has a short range", () => {
    const t = estimateTravel(10, "walk", 4000);
    expect(t.monthlyCost).toBe(0);
    expect(t.withinRange).toBe(false);
  });
  it("flags travel above 30% of the stipend", () => {
    const t = estimateTravel(30, "taxi", 2000);
    expect(t.affordable).toBe(false);
  });
});

describe("rankOpenings", () => {
  const youth = { id: "y1", location: braam, transportMode: "taxi" as const, skills: ["Excel", "customer service"] };
  const near = { id: "near", location: { lat: -26.19, lng: 28.04 }, monthlyStipend: 4000, requiredSkills: ["excel", "Customer Service"] };
  const far = { id: "far", location: pretoria, monthlyStipend: 4000, requiredSkills: ["excel", "customer service"] };
  const offSkill = { id: "off", location: soweto, monthlyStipend: 4000, requiredSkills: ["welding"] };

  it("ranks the near, skill-matched opening first", () => {
    const r = rankOpenings(youth, [far, offSkill, near]);
    expect(r[0]!.openingId).toBe("near");
    expect(r[0]!.matchedSkills).toHaveLength(2);
  });
  it("keeps far openings but flags them", () => {
    const r = rankOpenings(youth, [far]);
    expect(r).toHaveLength(1);
    expect(r[0]!.flags).toContain("OUT_OF_RANGE");
  });
  it("writes a why line", () => {
    expect(rankOpenings(youth, [near])[0]!.why).toMatch(/2 of 2 skills/);
  });
  it("uses embeddings when present", () => {
    expect(cosine([1, 0], [1, 0])).toBe(1);
    const r = rankOpenings({ ...youth, embedding: [1, 0] }, [{ ...offSkill, embedding: [1, 0] }]);
    expect(r[0]!.skillScore).toBe(0.5);
  });
});
