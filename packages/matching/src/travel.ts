export type TransportMode = "walk" | "taxi" | "bus";

/**
 * Assumptions — ESTIMATES for ranking, not quotes. Tune with real fares.
 * roadFactor: straight-line km × factor ≈ road km.
 */
export const TRAVEL_CONFIG = {
  roadFactor: 1.3,
  workDaysPerMonth: 21,
  modes: {
    walk: { speedKmh: 5, randPerKm: 0, baseFare: 0, maxOneWayKm: 4 },
    taxi: { speedKmh: 25, randPerKm: 1.2, baseFare: 10, maxOneWayKm: 40 },
    bus: { speedKmh: 20, randPerKm: 0.9, baseFare: 8, maxOneWayKm: 40 },
  },
  /** Travel above this share of the stipend is flagged as unaffordable. */
  maxStipendShare: 0.3,
} as const;

export interface TravelEstimate {
  mode: TransportMode;
  roadKm: number;
  oneWayMinutes: number;
  monthlyCost: number;
  shareOfStipend: number | null;
  withinRange: boolean;
  affordable: boolean;
}

export function estimateTravel(straightKm: number, mode: TransportMode, monthlyStipend?: number): TravelEstimate {
  const C = TRAVEL_CONFIG;
  const m = C.modes[mode];
  const roadKm = straightKm * C.roadFactor;
  const oneWayFare = roadKm === 0 ? 0 : m.baseFare + m.randPerKm * roadKm;
  const monthlyCost = Math.round(oneWayFare * 2 * C.workDaysPerMonth);
  const share = monthlyStipend && monthlyStipend > 0 ? monthlyCost / monthlyStipend : null;
  return {
    mode,
    roadKm: Math.round(roadKm * 10) / 10,
    oneWayMinutes: Math.round((roadKm / m.speedKmh) * 60),
    monthlyCost,
    shareOfStipend: share === null ? null : Math.round(share * 1000) / 1000,
    withinRange: roadKm <= m.maxOneWayKm,
    affordable: share === null ? true : share <= C.maxStipendShare,
  };
}
