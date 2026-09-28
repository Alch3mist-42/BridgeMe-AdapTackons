import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Used by Azure App Service health checks and to confirm deploys. */
export function GET() {
  return NextResponse.json({ ok: true, service: "opportunity-bridge", time: new Date().toISOString() });
}
