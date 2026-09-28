export type IdCitizenship = "citizen" | "permanent_resident" | "refugee";

export interface ParsedSaId {
  valid: true;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "female" | "male";
  citizenship: IdCitizenship;
}
export interface InvalidSaId {
  valid: false;
  reason: string;
}

/** Luhn check over all 13 digits. */
function luhnOk(id: string): boolean {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    let d = Number(id[id.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/**
 * Parse a 13-digit South African ID number: YYMMDD SSSS C A Z.
 * `today` decides the century (a YY in the future means 19YY).
 * POPIA: callers should keep only the derived date of birth, not the ID.
 */
export function parseSaId(raw: string, today: Date = new Date()): ParsedSaId | InvalidSaId {
  const id = raw.replace(/\s/g, "");
  if (!/^\d{13}$/.test(id)) return { valid: false, reason: "ID must be 13 digits" };
  if (!luhnOk(id)) return { valid: false, reason: "ID checksum is wrong" };

  const yy = Number(id.slice(0, 2));
  const mm = Number(id.slice(2, 4));
  const dd = Number(id.slice(4, 6));
  const currentYY = today.getUTCFullYear() % 100;
  const year = yy > currentYY ? 1900 + yy : 2000 + yy;
  const dob = new Date(Date.UTC(year, mm - 1, dd));
  if (dob.getUTCMonth() !== mm - 1 || dob.getUTCDate() !== dd) {
    return { valid: false, reason: "ID contains an impossible date of birth" };
  }

  const c = id[10];
  const citizenship: IdCitizenship | undefined =
    c === "0" ? "citizen" : c === "1" ? "permanent_resident" : c === "2" ? "refugee" : undefined;
  if (!citizenship) return { valid: false, reason: "ID citizenship digit is invalid" };

  return {
    valid: true,
    dateOfBirth: dob.toISOString().slice(0, 10),
    gender: Number(id.slice(6, 10)) < 5000 ? "female" : "male",
    citizenship,
  };
}

/** Age in whole years on a given date (both YYYY-MM-DD). */
export function ageOn(dateOfBirth: string, onDate: string): number {
  const [by, bm, bd] = dateOfBirth.split("-").map(Number) as [number, number, number];
  const [y, m, d] = onDate.split("-").map(Number) as [number, number, number];
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age--;
  return age;
}
