'use client';

import { useState } from "react";
import Image from "next/image";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";

const MOBILE_WIDTH = 390;
const MOBILE_HEIGHT = 844;
const DOT_SIZE = 40;

type ModuleLayout = {
  id: string;
  label: string;
  x: number; // pourcentage (0–100) position du centre
  y: number; // pourcentage (0–100) position du centre
};

const INITIAL_LAYOUT: ModuleLayout[] = [
  { id: "m01", label: "1", x: 80, y: 92 },
  { id: "m02", label: "2", x: 90, y: 67 },
  { id: "m03", label: "3", x: 90, y: 40 },
  { id: "m04", label: "4", x: 78, y: 20 },
  { id: "m05", label: "5", x: 55, y: 10 },
  { id: "m06", label: "6", x: 30, y: 18 },
  { id: "m07", label: "7", x: 14, y: 38 },
  { id: "m08", label: "8", x: 18, y: 60 },
  { id: "m09", label: "9", x: 32, y: 78 },
  { id: "m10", label: "10", x: 50, y: 82 },
  { id: "m11", label: "11", x: 66, y: 72 },
];

function toPixels(percent: number, total: number) {
  return (percent / 100) * total;
}

function toPercent(px: number, total: number) {
  return (px / total) * 100;
}

export default function LayoutEditorPage() {
  const [modules, setModules] = useState<ModuleLayout[]>(INITIAL_LAYOUT);
  const [isSaving, setIsSaving] = useState(false);

  function handleDragStop(id: string, _e: DraggableEvent, data: DraggableData) {
    const centerX = data.x + DOT_SIZE / 2;
    const centerY = data.y + DOT_SIZE / 2;

    const xPercent = Math.min(
      100,
      Math.max(0, toPercent(centerX, MOBILE_WIDTH)),
    );
    const yPercent = Math.min(
      100,
      Math.max(0, toPercent(centerY, MOBILE_HEIGHT)),
    );

    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, x: xPercent, y: yPercent } : m)),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // TODO: brancher sur l'API du backend (PUT /api/modules/layout par ex.)
      // Pour l'instant on log juste les valeurs calculées.
      // eslint-disable-next-line no-console
      console.log("Layout à sauvegarder (en %):", modules);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setModules(INITIAL_LAYOUT);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 lg:flex-row">
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
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-4 py-2 text-xs font-medium text-slate-900 shadow hover:bg-amber-200 disabled:opacity-60"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer le layout"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-900/60"
            >
              Reset layout
            </button>
          </div>

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

        <section className="flex flex-1 items-start justify-center">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
            <div
              className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-black"
              style={{ width: MOBILE_WIDTH, height: MOBILE_HEIGHT }}
            >
              <Image
                src="/escargot-lumière.png"
                alt="Layout de référence mobile"
                fill
                className="object-contain object-center"
                priority
              />

              {modules.map((m) => {
                const cx = toPixels(m.x, MOBILE_WIDTH);
                const cy = toPixels(m.y, MOBILE_HEIGHT);
                const px = cx - DOT_SIZE / 2;
                const py = cy - DOT_SIZE / 2;

                return (
                  <Draggable
                    key={`${m.id}-${m.x.toFixed(2)}-${m.y.toFixed(2)}`}
                    defaultPosition={{ x: px, y: py }}
                    bounds="parent"
                    onStop={(e, data) => handleDragStop(m.id, e, data)}
                  >
                    <button
                      type="button"
                      className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/70 bg-amber-200/90 text-xs font-semibold text-slate-900 shadow-[0_0_30px_rgba(252,211,77,0.7)] hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    >
                      {m.label}
                    </button>
                  </Draggable>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

