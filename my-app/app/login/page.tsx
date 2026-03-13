'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/layout-editor";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible de se connecter");
      }

      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message ?? "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_0%_0%,rgba(184,75,176,0.25),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(47,191,177,0.25),transparent_55%),linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        <div className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          Espace admin
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-50">
          Connexion Mirokaï Experience
        </h1>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Accède aux outils d&apos;administration et de configuration de
          l&apos;expérience.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-amber-300 focus:bg-slate-900 focus:ring-2 focus:ring-amber-300/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-slate-200">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-amber-300 focus:bg-slate-900 focus:ring-2 focus:ring-amber-300/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(251,191,36,0.45)] transition hover:brightness-105 disabled:opacity-60"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

