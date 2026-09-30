// OWNER: role D. Protected: ADMIN only.
import Link from "next/link";
import { prisma } from "@ob/db";
import { requirePageRole } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await requirePageRole(["ADMIN"]);
  const [unverified, openReports, auditCount] = await Promise.all([
    prisma.business.count({ where: { verificationTier: "UNVERIFIED" } }),
    prisma.report.count({ where: { resolved: false } }),
    prisma.auditLog.count(),
  ]);

  const cards = [
    { href: "/admin/verification", label: "Businesses awaiting verification", value: unverified },
    { href: "/admin/reports", label: "Open reports", value: openReports },
    { href: "/admin/audit", label: "Audit log entries", value: auditCount },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <LogoutButton />
      </div>
      <p className="text-slate-600 dark:text-slate-400">Signed in as {session.name}.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{c.label}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
