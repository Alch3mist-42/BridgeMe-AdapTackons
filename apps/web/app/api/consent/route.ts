import { NextResponse } from "next/server";
import { prisma } from "@ob/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const consent = await prisma.consent.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ consent });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { granted, type, version } = body;

  if (typeof granted !== "boolean") {
    return NextResponse.json({ error: "Invalid granted status" }, { status: 400 });
  }

  const consent = await prisma.consent.create({
    data: {
      userId: session.userId,
      granted,
      type: type || "POPIA_GENERAL",
      version: version || "1.0",
    },
  });

  return NextResponse.json({ consent }, { status: 201 });
}
