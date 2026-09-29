import type { Match } from "../_data/fakeMatches";

const TRAVEL_FLAG_RATIO = 0.3; // flag if travel > 30% of stipend

export function MatchCard({ m }: { m: Match }) {
  const ratio = m.monthlyTravelCost / m.monthlyStipend;
  const flagged = ratio > TRAVEL_FLAG_RATIO;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{m.title}</h3>
          <p className="text-sm text-gray-600">
            {m.business} · {m.area}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {m.fitScore}% fit
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-800">
        <span className="font-medium">Why this match: </span>
        {m.why}
      </p>

      <p className="mt-2 text-sm text-gray-700">
        About {m.travelMinutes} min by {m.travelMode}, est. R
        {m.monthlyTravelCost.toLocaleString("en-ZA")}/month travel
      </p>

      {flagged && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Travel is about {Math.round(ratio * 100)}% of the stipend. You can
          still apply.
        </p>
      )}

      <button className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white active:bg-indigo-700">
        Apply
      </button>
    </article>
  );
}