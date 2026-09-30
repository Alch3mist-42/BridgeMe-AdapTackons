import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { Role } from "@ob/db";
import { getSession, type Session } from "./session";

/** Wrap every API route: export const GET = withRole(["ADMIN"], async (req, ctx, session) => {...}) */
export function withRole<C = unknown>(
  roles: Role[],
  handler: (req: Request, ctx: C, session: Session) => Promise<Response> | Response,
) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if (!roles.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return handler(req, ctx, session);
  };
}

/** For protected pages: redirects to /login if not signed in or wrong role. */
export async function requirePageRole(roles: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) redirect("/login");
  return session;
}
