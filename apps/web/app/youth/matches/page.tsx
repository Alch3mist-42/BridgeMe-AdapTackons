// TEMP: swap back to real imports once Oats merges lib/auth.ts and lib/audit.ts
// import { requireRole } from "@/lib/auth";
// import { audit } from "@/lib/audit";
import { fakeMatches } from "../_data/fakeMatches";
import { MatchCard } from "../_components/MatchCard";

export default async function MatchesPage() {
  // const user = await requireRole("YOUTH");

  const sorted = [...fakeMatches].sort((a, b) => {
    const fa = a.monthlyTravelCost / a.monthlyStipend > 0.3 ? 1 : 0;
    const fb = b.monthlyTravelCost / b.monthlyStipend > 0.3 ? 1 : 0;
    return fa - fb || b.fitScore - a.fitScore;
  });

  // await Promise.all(
  //   sorted.map((m) => audit("match_shown", "Placement", m.id, { youthId: user.id }))
  // );

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">Your matches</h1>
      <p className="text-sm text-gray-600">We rank and explain. You decide.</p>
      {sorted.map((m) => (
        <MatchCard key={m.id} m={m} />
      ))}
    </main>
  );
}