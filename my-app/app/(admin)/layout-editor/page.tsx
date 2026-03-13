'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { fetchModulesForLayout, saveModulesLayout } from "@/lib/api/modulesLayout";

const MOBILE_WIDTH = 390;
const MOBILE_HEIGHT = 844;
const DOT_SIZE = 40;

type ModuleLayout = {
  id: string; // id MongoDB
  label: string;
  x: number; // pourcentage (0–100) position du centre
  y: number; // pourcentage (0–100) position du centre
};

function toPercent(px: number, total: number) {
  return (px / total) * 100;
}

export default function LayoutEditorPage() {
  const [modules, setModules] = useState<ModuleLayout[]>([]);
  const [initialModules, setInitialModules] = useState<ModuleLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModules() {
      setIsLoading(true);
      setError(null);
      try {
        const apiModules = await fetchModulesForLayout();

        const mapped: ModuleLayout[] = apiModules
          .filter((m) => !!m.id)
          .map((m) => {
            const x = m.position?.x ?? 50;
            const y = m.position?.y ?? 50;
            return {
              id: m.id,
              label: String(m.number ?? "?"),
              x,
              y,
            };
          })
          .sort((a, b) => Number(a.label) - Number(b.label));

        if (!cancelled) {
          setModules(mapped);
          setInitialModules(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Impossible de charger les modules depuis l’API.");
        }
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadModules();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateModulePositionFromPointer(id: string, clientX: number, clientY: number) {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const xPx = clientX - rect.left;
    const yPx = clientY - rect.top;

    const xPercent = Math.min(100, Math.max(0, toPercent(xPx, MOBILE_WIDTH)));
    const yPercent = Math.min(100, Math.max(0, toPercent(yPx, MOBILE_HEIGHT)));

    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, x: xPercent, y: yPercent } : m)),
    );
  }

  function handlePointerDown(id: string, event: React.PointerEvent<HTMLButtonElement>) {
    (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
    setDraggingId(id);
    updateModulePositionFromPointer(id, event.clientX, event.clientY);
  }

  function handlePointerMove(id: string, event: React.PointerEvent<HTMLButtonElement>) {
    if (draggingId !== id) return;
    updateModulePositionFromPointer(id, event.clientX, event.clientY);
  }

  function handlePointerUp(id: string, event: React.PointerEvent<HTMLButtonElement>) {
    if (draggingId !== id) return;
    try {
      (event.currentTarget as HTMLButtonElement).releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
    setDraggingId(null);
  }

  async function handleSave() {
    if (!modules.length) return;

    setIsSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const payload = modules.map((m) => ({
        id: m.id,
        x: m.x,
        y: m.y,
      }));
      await saveModulesLayout(payload);
      setSaveMessage("Layout enregistré avec succès.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setModules(initialModules);
    setSaveMessage(null);
  }

  return (
    <div className="space-y-6">
      <section className="flex-1 space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Outil d&apos;arrangement
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Layout mobile des modules
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Déplace les pastilles pour ajuster la position des 11 modules sur
            l&apos;image de parcours. Les coordonnées sont calculées en
            pourcentage par rapport à une référence mobile de{" "}
            {MOBILE_WIDTH}px.
          </p>
        </header>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading || !modules.length}
            className="inline-flex items-center justify-center rounded-full bg-amber-300 px-4 py-2 text-xs font-medium text-slate-900 shadow hover:bg-amber-200 disabled:opacity-60"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer le layout"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading || !modules.length}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-900/60 disabled:opacity-50"
          >
            Reset layout
          </button>
        </div>

        {isLoading && (
          <p className="mt-2 text-xs text-slate-400">
            Chargement des modules…
          </p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-400">
            {error}
          </p>
        )}
        {saveMessage && !error && (
          <p className="mt-2 text-xs text-emerald-400">
            {saveMessage}
          </p>
        )}

        <div className="mt-6">
          <h2 className="text-sm font-medium text-slate-200">
            Coordonnées actuelles (en %)
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300 sm:grid-cols-3 md:grid-cols-4">
            {modules.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <span className="font-medium text-slate-100">
                  #{m.label}
                </span>
                <span className="tabular-nums text-slate-400">
                  x: {m.x.toFixed(1)} · y: {m.y.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-start justify-center">
        <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
          <div
            className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-black"
            style={{ width: MOBILE_WIDTH, height: MOBILE_HEIGHT }}
            ref={containerRef}
          >
            <Image
              src="/map-bg.svg"
              alt="Layout de référence mobile"
              fill
              className="object-contain object-center"
              priority
            />

            {modules.map((m) => (
              <button
                key={m.id}
                type="button"
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                }}
                className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-200/70 bg-amber-200/90 text-xs font-semibold text-slate-900 shadow-[0_0_30px_rgba(252,211,77,0.7)] hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                onPointerDown={(e) => handlePointerDown(m.id, e)}
                onPointerMove={(e) => handlePointerMove(m.id, e)}
                onPointerUp={(e) => handlePointerUp(m.id, e)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


