import { prisma } from "@ob/db";
import { requirePageRole } from "@/lib/auth";
import { VerifyControls } from "./VerifyControls";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  await requirePageRole(["ADMIN"]);
  const all = await prisma.business.findMany({ include: { owner: { select: { name: true, email: true } } } });
  const businesses = [...all].sort(
    (a, b) => Number(b.verificationTier === "UNVERIFIED") - Number(a.verificationTier === "UNVERIFIED"),
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Business verification</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-4">Business</th>
              <th className="py-2 pr-4">Owner</th>
              <th className="py-2 pr-4">Sector</th>
              <th className="py-2 pr-4">CIPC no.</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 dark:border-slate-900">
                <td className="py-2 pr-4 font-medium">{b.name}</td>
                <td className="py-2 pr-4">{b.owner.name}</td>
                <td className="py-2 pr-4">{b.sector}</td>
                <td className="py-2 pr-4">{b.cipcNumber ?? "-"}</td>
                <td className="py-2"><VerifyControls id={b.id} tier={b.verificationTier} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
