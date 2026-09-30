"use client";
import { useState } from "react";

const HOME: Record<string, string> = { ADMIN: "/admin", BUSINESS: "/business", YOUTH: "/youth" };

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      window.location.href = HOME[body.role] ?? "/";
    } else {
      setError(body.error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form onSubmit={submit} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" autoComplete="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-transparent" />
        <input name="password" type="password" required placeholder="Password" autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-transparent" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50">
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}
