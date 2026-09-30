import { prisma } from "@ob/db";
import { requirePageRole } from "@/lib/auth";
import { ResolveButton } from "./ResolveButton";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePageRole(["ADMIN"]);
  const reports = await prisma.report.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    include: { reporter: { select: { name: true } } },
  });
  const targets = await prisma.user.findMany({
    where: { id: { in: reports.map((r) => r.targetUserId) } },
    select: { id: true, name: true },
  });
  const targetName = new Map(targets.map((t) => [t.id, t.name]));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      {reports.length === 0 && <p className="text-slate-600 dark:text-slate-400">No reports.</p>}
      <ul className="space-y-3">
        {reports.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="space-y-1">
              <p className="font-medium">
                {r.reporter.name} reported {targetName.get(r.targetUserId) ?? "unknown user"}
              </p>
              <p className="text-sm">{r.reason}</p>
              <p className="text-xs text-slate-500">{r.createdAt.toLocaleString("en-ZA")}</p>
            </div>
            {r.resolved ? (
              <span className="text-sm text-emerald-600">Resolved</span>
            ) : (
              <ResolveButton id={r.id} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
