import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Work experience for youth. Zero-risk hiring for local businesses.</h1>
      <p className="max-w-2xl text-slate-600 dark:text-slate-400">
        Youth register their skills and get matched to nearby placements they can afford to travel to.
        Businesses see the tax incentive they qualify for, get the paperwork pre-filled, and keep an
        audit-proof record of real work.
      </p>
      <div className="flex gap-3">
        <Link href="/youth" className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white">I&apos;m looking for experience</Link>
        <Link href="/business" className="rounded-lg border border-slate-300 px-4 py-2 font-medium dark:border-slate-700">I&apos;m a business</Link>
      </div>
    </section>
  );
}
