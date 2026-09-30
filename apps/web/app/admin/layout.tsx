import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b border-slate-200 pb-3 text-sm dark:border-slate-800">
        <Link href="/admin">Overview</Link>
        <Link href="/admin/verification">Verification</Link>
        <Link href="/admin/reports">Reports</Link>
        <Link href="/admin/audit">Audit log</Link>
      </nav>
      {children}
    </div>
  );
}
