import { haversineKm, type LatLng } from "./geo";
import { estimateTravel, type TransportMode, type TravelEstimate } from "./travel";

export interface Candidate {
  id: string;
  location: LatLng;
  transportMode: TransportMode;
  skills: string[];
  /** Optional embedding from Azure OpenAI (role B). */
  embedding?: number[];
}
export interface Opening {
  id: string;
  location: LatLng;
  monthlyStipend: number;
  requiredSkills: string[];
  embedding?: number[];
}
export interface Match {
  openingId: string;
  score: number; // 0..1
  skillScore: number;
  travelScore: number;
  travel: TravelEstimate;
  matchedSkills: string[];
  /** Human-readable reason shown on the card. */
  why: string;
  flags: ("OUT_OF_RANGE" | "TRAVEL_UNAFFORDABLE")[];
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i]! * b[i]!; na += a[i]! ** 2; nb += b[i]! ** 2;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Rank openings for a candidate. The AI never rejects: out-of-range or
 * unaffordable openings are ranked lower and flagged, not hidden.
 */
export function rankOpenings(c: Candidate, openings: Opening[], weights = { skill: 0.7, travel: 0.3 }): Match[] {
  const mine = new Set(c.skills.map(norm));
  return openings
    .map((o) => {
      const matchedSkills = o.requiredSkills.filter((s) => mine.has(norm(s)));
      const overlap = o.requiredSkills.length ? matchedSkills.length / o.requiredSkills.length : 0;
      const semantic = c.embedding && o.embedding ? Math.max(0, cosine(c.embedding, o.embedding)) : null;
      const skillScore = semantic === null ? overlap : 0.5 * overlap + 0.5 * semantic;

      const travel = estimateTravel(haversineKm(c.location, o.location), c.transportMode, o.monthlyStipend);
      const share = travel.shareOfStipend ?? 0;
      let travelScore = Math.max(0, 1 - share / 0.5);
      const flags: Match["flags"] = [];
      if (!travel.withinRange) { flags.push("OUT_OF_RANGE"); travelScore *= 0.3; }
      if (!travel.affordable) flags.push("TRAVEL_UNAFFORDABLE");

      const score = Math.round((weights.skill * skillScore + weights.travel * travelScore) * 1000) / 1000;
      const skillText = matchedSkills.length
        ? `You have ${matchedSkills.length} of ${o.requiredSkills.length} skills (${matchedSkills.join(", ")})`
        : "Few direct skill matches — good chance to learn";
      const why = `${skillText}. About ${travel.oneWayMinutes} min by ${travel.mode}, est. R${travel.monthlyCost}/month travel.`;
      return { openingId: o.id, score, skillScore, travelScore, travel, matchedSkills, why, flags };
    })
    .sort((a, b) => b.score - a.score);
}
