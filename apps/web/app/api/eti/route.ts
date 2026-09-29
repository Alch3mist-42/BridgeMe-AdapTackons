import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateEti, REASON_TEXT } from "@ob/incentives";

const EtiRequestSchema = z.object({
  dateOfBirth: z.string(), // YYYY-MM-DD
  claimMonth: z.string(), // YYYY-MM
  monthlyRemuneration: z.number().positive(),
  hoursPaid: z.number().min(0),
  monthsAlreadyClaimed: z.number().min(0),
  minimumHourlyWage: z.number().positive(),
  isConnectedPerson: z.boolean().optional(),
  isDomesticWorker: z.boolean().optional(),
  employerEligible: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = EtiRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = calculateEti(parsed.data);
  const reasonText = result.reasons.map((r) => REASON_TEXT[r]);

  return NextResponse.json({ ...result, reasonText });
}