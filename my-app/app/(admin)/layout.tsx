'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition",
        isActive
          ? "bg-amber-300 text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.35)]"
          : "text-slate-200 hover:bg-slate-800/80",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        {/* Sidebar desktop */}
        <aside className="hidden w-56 flex-shrink-0 border-r border-slate-800 bg-[radial-gradient(circle_at_0%_0%,rgba(184,75,176,0.25),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(47,191,177,0.25),transparent_55%),linear-gradient(to_bottom,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] px-5 py-6 md:flex md:flex-col">
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
              Enchanted Tools
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight text-slate-50">
              Admin Mirokaï
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-xs">
            <NavLink href="/" label="Dashboard" />
            <NavLink href="/modules" label="Modules" />
            <NavLink href="/layout-editor" label="Layout" />
            <NavLink href="/robot-parts" label="Robot Parts" />
            <NavLink href="/robot-layout" label="Robot Layout" />
            <NavLink href="/games" label="Games" />
          </nav>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {/* Header compact sur mobile */}
          <header className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3 md:hidden">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setIsMobileNavOpen(true)}
              className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-100"
            >
              <span className="space-y-1.5">
                <span className="block h-0.5 w-4 bg-slate-100" />
                <span className="block h-0.5 w-4 bg-slate-100" />
                <span className="block h-0.5 w-3 bg-slate-100" />
              </span>
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
                Enchanted Tools
              </p>
              <p className="text-sm font-semibold tracking-tight text-slate-50">
                Admin Mirokaï
              </p>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>

      {/* Overlay + drawer mobile */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Drawer à gauche */}
          <aside className="h-full w-64 border-r border-slate-800 bg-[radial-gradient(circle_at_0%_0%,rgba(184,75,176,0.35),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(47,191,177,0.35),transparent_55%),linear-gradient(to_bottom,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] px-5 py-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] transform animate-[slideIn_200ms_ease-out_forwards]">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
                Enchanted Tools
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-slate-50">
                Admin Mirokaï
              </p>
            </div>
            <nav
              className="flex flex-col gap-2 text-xs"
              onClick={() => setIsMobileNavOpen(false)}
            >
              <NavLink href="/" label="Dashboard" />
              <NavLink href="/modules" label="Modules" />
              <NavLink href="/layout-editor" label="Layout" />
              <NavLink href="/robot-parts" label="Robot Parts" />
              <NavLink href="/robot-layout" label="Robot Layout" />
              <NavLink href="/games" label="Games" />
            </nav>
          </aside>
          {/* Fond sombre clicable pour fermer */}
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setIsMobileNavOpen(false)}
            className="h-full flex-1 bg-black/40 animate-fadeIn"
          />
        </div>
      )}
    </div>
  );
}

