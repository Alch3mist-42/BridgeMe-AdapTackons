import { NextResponse } from "next/server";
import { prisma } from "@ob/db";
import { withRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = withRole(["ADMIN"], async () => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, role: true } } },
  });
  return NextResponse.json({ logs });
});
