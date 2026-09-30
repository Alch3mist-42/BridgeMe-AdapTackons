import { NextResponse } from "next/server";
import { prisma } from "@ob/db";
import { withRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export const POST = withRole<{ params: Promise<{ id: string }> }>(["ADMIN"], async (_req, ctx, session) => {
  const { id } = await ctx.params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  await prisma.report.update({ where: { id }, data: { resolved: true } });
  await logAudit({
    actorId: session.userId,
    action: "REPORT_RESOLVED",
    entity: "Report",
    entityId: id,
    meta: { targetUserId: report.targetUserId },
  });
  return NextResponse.json({ ok: true });
});
