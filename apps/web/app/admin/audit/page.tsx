import { prisma } from "@ob/db";
import { requirePageRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requirePageRole(["ADMIN"]);
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, role: true } } },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">Latest 200 entries.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Who</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2">Record</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 dark:border-slate-900">
                <td className="whitespace-nowrap py-2 pr-4">{l.createdAt.toLocaleString("en-ZA")}</td>
                <td className="py-2 pr-4">{l.actor ? `${l.actor.name} (${l.actor.role})` : "system"}</td>
                <td className="py-2 pr-4 font-mono text-xs">{l.action}</td>
                <td className="py-2 font-mono text-xs">{l.entity}:{l.entityId.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
