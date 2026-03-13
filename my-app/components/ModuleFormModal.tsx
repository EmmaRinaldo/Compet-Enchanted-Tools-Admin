"use client";

import type { FormEvent, ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { uploadModuleAudio, uploadModuleImage } from "@/lib/api/uploads";
import type { GameFromApi } from "@/lib/api/games";
import { fetchGames } from "@/lib/api/games";
import type { RobotPartFromApi } from "@/lib/api/robotParts";
import { fetchRobotParts } from "@/lib/api/robotParts";

export type ModuleFormValues = {
  number: number | "";
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  audioUrl: string;
  gameId: string;
  robotPart: string;
  isActive: boolean;
};

export type ModuleFormMode = "create" | "edit";

type ModuleFormModalProps = {
  mode: ModuleFormMode;
  initialValues?: Partial<ModuleFormValues>;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ModuleFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

const EMPTY_VALUES: ModuleFormValues = {
  number: "",
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  audioUrl: "",
  gameId: "",
  robotPart: "",
  isActive: true,
};

export function ModuleFormModal({
  mode,
  initialValues,
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ModuleFormModalProps) {
  const [values, setValues] = useState<ModuleFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSlugDirty, setIsSlugDirty] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [games, setGames] = useState<GameFromApi[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [robotParts, setRobotParts] = useState<RobotPartFromApi[]>([]);
  const [isLoadingRobotParts, setIsLoadingRobotParts] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setIsSlugDirty(false);
    setValues({
      ...EMPTY_VALUES,
      ...initialValues,
    });
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadGames = async () => {
      setIsLoadingGames(true);
      try {
        const data = await fetchGames();
        if (!cancelled) {
          setGames(data);
        }
      } catch {
        // On laisse simplement la liste vide en cas d'erreur (MVP).
        if (!cancelled) {
          setGames([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingGames(false);
        }
      }
    };

    void loadGames();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadRobotParts = async () => {
      setIsLoadingRobotParts(true);
      try {
        const data = await fetchRobotParts();
        if (!cancelled) {
          setRobotParts(data);
        }
      } catch {
        if (!cancelled) {
          setRobotParts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRobotParts(false);
        }
      }
    };

    void loadRobotParts();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const title = mode === "create" ? "Créer un module" : "Modifier le module";

  const handleChange =
    (field: keyof ModuleFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, checked } = event.target as HTMLInputElement;

      setValues((prev) => {
        if (field === "number") {
          const parsed = value === "" ? "" : Number(value);
          return { ...prev, number: Number.isNaN(parsed) ? prev.number : parsed };
        }

        if (field === "isActive") {
          return { ...prev, isActive: type === "checkbox" ? checked : prev.isActive };
        }

        if (field === "name") {
          const next = { ...prev, name: value };
          if (!isSlugDirty) {
            const autoSlug = value
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            next.slug = autoSlug;
          }
          return next;
        }

        if (field === "slug") {
          setIsSlugDirty(true);
          return {
            ...prev,
            slug: value,
          };
        }

        return {
          ...prev,
          [field]: value,
        };
      });
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (values.name.trim() === "") {
      setError("Le nom du module est obligatoire.");
      return;
    }

    if (values.slug.trim() === "") {
      setError("Le slug est obligatoire.");
      return;
    }

    if (values.description.trim() === "") {
      setError("La description est obligatoire.");
      return;
    }

    if (values.videoUrl.trim() === "") {
      setError("L’URL vidéo est obligatoire.");
      return;
    }

    try {
      await onSubmit(values);
    } catch (err) {
      setError("Impossible d’enregistrer le module pour le moment.");
    }
  };

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setError(null);
    try {
      const url = await uploadModuleImage(file);
      setValues((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      setError("Impossible d’uploader l’image du module pour le moment.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAudioFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingAudio(true);
    setError(null);
    try {
      const url = await uploadModuleAudio(file);
      setValues((prev) => ({ ...prev, audioUrl: url }));
    } catch {
      setError("Impossible d’uploader l’audio du module pour le moment.");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-50">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800/80"
          >
            <span className="text-sm leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            {mode === "edit" && (
              <label className="space-y-1">
                <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Ordre / numéro
                </span>
                <input
                  type="number"
                  min={1}
                  value={values.number}
                  onChange={handleChange("number")}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
                />
              </label>
            )}

            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Actif
              </span>
              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3">
                <input
                  id="module-is-active"
                  type="checkbox"
                  checked={values.isActive}
                  onChange={handleChange("isActive")}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-300"
                />
                <label htmlFor="module-is-active" className="text-xs text-slate-200">
                  Module actif dans l’expérience
                </label>
              </div>
            </label>
          </div>

          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Nom <span className="text-rose-400">*</span>
            </span>
            <input
              type="text"
              value={values.name}
              onChange={handleChange("name")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              placeholder="Ex. La naissance d’Enchanted Tools"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Slug <span className="text-rose-400">*</span>
            </span>
            <input
              type="text"
              value={values.slug}
              onChange={handleChange("slug")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              placeholder="Ex. naissance-enchanted-tools"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Description <span className="text-rose-400">*</span>
            </span>
            <textarea
              rows={3}
              value={values.description}
              onChange={handleChange("description")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              placeholder="Courte description du module visible dans l’admin."
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Image (upload)
              </span>
              <div className="space-y-1">
                {values.imageUrl && (
                  <p className="text-[11px] text-slate-400 break-all">
                    Image actuelle: <span className="text-slate-200">{values.imageUrl}</span>
                  </p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-50 hover:file:bg-slate-700"
                  disabled={isUploadingImage || isSubmitting}
                />
                {isUploadingImage && (
                  <p className="text-[11px] text-slate-400">Upload de l’image en cours…</p>
                )}
              </div>
            </label>

            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Vidéo URL
              </span>
              <input
                type="text"
                value={values.videoUrl}
                onChange={handleChange("videoUrl")}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
                placeholder="https://... (lien vidéo)"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Audio (mp4)
              </span>
              <div className="space-y-1">
                {values.audioUrl && (
                  <p className="text-[11px] text-slate-400 break-all">
                    Audio actuel: <span className="text-slate-200">{values.audioUrl}</span>
                  </p>
                )}
                <input
                  type="file"
                  accept="audio/mp4,audio/mpeg"
                  onChange={handleAudioFileChange}
                  className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-50 hover:file:bg-slate-700"
                  disabled={isUploadingAudio || isSubmitting}
                />
                {isUploadingAudio && (
                  <p className="text-[11px] text-slate-400">Upload de l’audio en cours…</p>
                )}
              </div>
            </label>

            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Jeu associé
              </span>
              <select
                value={values.gameId}
                onChange={handleChange("gameId") as any}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              >
                <option value="">Aucun jeu</option>
                {isLoadingGames && (
                  <option value="" disabled>
                    Chargement des jeux…
                  </option>
                )}
                {!isLoadingGames &&
                  games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name} ({game.type})
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Partie du robot
            </span>
            <select
              value={values.robotPart}
              onChange={handleChange("robotPart") as any}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
            >
              <option value="">Aucune partie</option>
              {/* TODO: options dynamiques une fois l’API robot_parts disponible */}
              {isLoadingRobotParts && (
                <option value="" disabled>
                  Chargement des parties…
                </option>
              )}
              {!isLoadingRobotParts &&
                robotParts.map((part) => (
                  <option key={part.id} value={part.partName}>
                    {part.partName}
                  </option>
                ))}
            </select>
          </label>

          {error && (
            <p className="text-xs text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/80"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-amber-300 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(251,191,36,0.45)] hover:brightness-105 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {mode === "create" ? "Créer" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

