// OWNER: role D — reports queue, verification, audit log. Protected: ADMIN only.
import { requirePageRole } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await requirePageRole(["ADMIN"]);
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <LogoutButton />
      </div>
      <p className="text-slate-600 dark:text-slate-400">Signed in as {session.name}.</p>
    </section>
  );
}
