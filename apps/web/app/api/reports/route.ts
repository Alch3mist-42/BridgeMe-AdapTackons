import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@ob/db";
import { withRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const Body = z.object({ targetUserId: z.string().min(1), reason: z.string().min(5).max(1000) });

/** Youth and businesses can report another user. Admins review in /admin/reports. */
export const POST = withRole(["YOUTH", "BUSINESS"], async (req, _ctx, session) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Give a reason (5 to 1000 characters)" }, { status: 400 });
  if (parsed.data.targetUserId === session.userId) {
    return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 });
  }
  const target = await prisma.user.findUnique({ where: { id: parsed.data.targetUserId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const report = await prisma.report.create({
    data: { reporterId: session.userId, targetUserId: target.id, reason: parsed.data.reason },
  });
  await logAudit({ actorId: session.userId, action: "REPORT_CREATED", entity: "Report", entityId: report.id });
  return NextResponse.json({ ok: true, id: report.id }, { status: 201 });
});
