import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@ob/db";
import { withRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const Body = z.object({ tier: z.enum(["UNVERIFIED", "ID_VERIFIED", "CIPC_VERIFIED"]) });

export const PATCH = withRole<{ params: Promise<{ id: string }> }>(["ADMIN"], async (req, ctx, session) => {
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const updated = await prisma.business.update({ where: { id }, data: { verificationTier: parsed.data.tier } });
  await logAudit({
    actorId: session.userId,
    action: "BUSINESS_VERIFICATION_CHANGED",
    entity: "Business",
    entityId: id,
    meta: { from: existing.verificationTier, to: updated.verificationTier },
  });
  return NextResponse.json({ ok: true });
});
