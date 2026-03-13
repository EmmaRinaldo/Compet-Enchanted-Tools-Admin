"use client";

import { useEffect, useState } from "react";
import { fetchRobotLayout, type RobotLayoutPartFromApi } from "@/lib/api/robotLayout";

export default function RobotLayoutPage() {
  const [parts, setParts] = useState<RobotLayoutPartFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const json = await fetchRobotLayout();
        if (!cancelled) {
          setParts(json);
          // On ne gère plus ici la sauvegarde des positions, uniquement l'aperçu.
        }
      } catch {
        if (!cancelled) setError("Impossible de charger le layout du robot depuis l’API.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">
            Robot Layout
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Aperçu du robot en version grise, construit à partir des parties et variantes.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        {isLoading && (
          <div className="py-6 text-sm text-slate-400">Chargement du layout du robot…</div>
        )}

        {!isLoading && error && (
          <div className="py-4 text-sm text-rose-300">{error}</div>
        )}

        {!isLoading && !error && (
          <div className="relative mx-auto h-[480px] max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[360px] w-[360px]">
                {parts.map((part) => {
                  const variants = part.variants ?? [];
                  const greyVariant =
                    variants.find(
                      (v) =>
                        v.color.toLowerCase() === "gris" ||
                        v.color.toLowerCase() === "grey" ||
                        v.color.toLowerCase() === "gray",
                    ) || variants[0];

                  if (greyVariant && greyVariant.imageUrl) {
                    return (
                      <img
                        key={part.id}
                        src={greyVariant.imageUrl}
                        alt={part.partName}
                        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain"
                        style={{ zIndex: part.zIndex }}
                      />
                    );
                  }

                  return (
                    <div
                      key={part.id}
                      className="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center text-xs font-semibold text-slate-200"
                      style={{ zIndex: part.zIndex }}
                    >
                      {part.partName}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <p className="text-[11px] text-slate-500">
        Cette page affiche un aperçu superposé du robot en version grise à partir des variantes
        configurées. Le placement précis reste géré par les données fournies par le backend pour le
        front visiteur.
      </p>
    </div>
  );
}


