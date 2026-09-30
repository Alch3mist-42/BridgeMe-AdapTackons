import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@ob/db";
import { createSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const valid = user?.passwordHash ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;

  if (!user || !valid) {
    if (user) await logAudit({ actorId: user.id, action: "LOGIN_FAILED", entity: "User", entityId: user.id }).catch(() => {});
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  await logAudit({ actorId: user.id, action: "LOGIN", entity: "User", entityId: user.id });
  return NextResponse.json({ ok: true, role: user.role });
}
