"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ALLOWED_GAME_TYPES,
  type GameFromApi,
  type GamePayload,
  createGame,
  deleteGame,
  fetchGames,
  updateGame,
} from "@/lib/api/games";
import { QuizConfigBuilder, type QuizConfig } from "@/components/QuizConfigBuilder";

type GameFormMode = "create" | "edit";

type GameFormValues = {
  name: string;
  type: GameFromApi["type"];
  extraInfo: string;
  configText: string;
  configOverride?: unknown;
};

const EMPTY_VALUES: GameFormValues = {
  name: "",
  type: "none",
  extraInfo: "",
  configText: "{\n  \n}",
  configOverride: undefined,
};

type GameFormModalProps = {
  mode: GameFormMode;
  open: boolean;
  initialGame?: GameFromApi | null;
  onClose: () => void;
  onSubmit: (values: GameFormValues) => Promise<void>;
  isSubmitting: boolean;
};

function GameFormModal({ mode, open, initialGame, onClose, onSubmit, isSubmitting }: GameFormModalProps) {
  const [values, setValues] = useState<GameFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({ steps: [] });

  const isQuiz = values.type === "quiz";

  function parseInitialQuizConfig(raw: unknown): QuizConfig {
    if (!raw || typeof raw !== "object") return { steps: [] };
    const anyRaw = raw as any;
    if (!Array.isArray(anyRaw.steps)) return { steps: [] };
    return {
      steps: anyRaw.steps.map((s: any) => ({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        question: typeof s.question === "string" ? s.question : "",
        image: typeof s.image === "string" ? s.image : "",
        extraInfo: typeof s.extraInfo === "string" ? s.extraInfo : "",
        answers: Array.isArray(s.answers)
          ? s.answers.map((a: any) => ({
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              type: a?.type === "image" ? "image" : "text",
              value: typeof a?.value === "string" ? a.value : "",
              isCorrect: Boolean(a?.isCorrect),
            }))
          : [],
      })),
    };
  }

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (initialGame) {
      const initialQuiz =
        initialGame.type === "quiz" ? parseInitialQuizConfig(initialGame.config) : { steps: [] };
      setQuizConfig(initialQuiz);
      setValues({
        name: initialGame.name,
        type: initialGame.type,
        extraInfo: initialGame.extraInfo ?? "",
        configText: JSON.stringify(initialGame.config ?? {}, null, 2),
        configOverride: initialGame.type === "quiz" ? initialQuiz : undefined,
      });
    } else {
      setQuizConfig({ steps: [] });
      setValues(EMPTY_VALUES);
    }
  }, [open, initialGame]);

  if (!open) return null;

  const title = mode === "create" ? "Créer un jeu" : "Modifier le jeu";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Le nom du jeu est obligatoire.");
      return;
    }

    if (isQuiz) {
      if (!quizConfig.steps.length) {
        setError("Le quiz doit contenir au moins une étape.");
        return;
      }

      for (const step of quizConfig.steps) {
        if (!step.question.trim()) {
          setError("Chaque étape du quiz doit avoir une question.");
          return;
        }
        const validAnswers = step.answers.filter((a) => a.value.trim() !== "");
        if (validAnswers.length < 2) {
          setError("Chaque étape du quiz doit avoir au moins deux réponses.");
          return;
        }
        const correctCount = validAnswers.filter((a) => a.isCorrect).length;
        if (correctCount !== 1) {
          setError("Chaque étape du quiz doit avoir exactement une bonne réponse.");
          return;
        }
      }

      const cleanConfig: QuizConfig = {
        steps: quizConfig.steps.map((step) => ({
          id: step.id,
          question: step.question.trim(),
          image: step.image.trim(),
          extraInfo: step.extraInfo.trim(),
          answers: step.answers
            .filter((a) => a.value.trim() !== "")
            .map((a) => ({
              id: a.id,
              type: a.type,
              value: a.value.trim(),
              isCorrect: a.isCorrect,
            })),
        })),
      };

      await onSubmit({
        ...values,
        configText: JSON.stringify(cleanConfig, null, 2),
        configOverride: cleanConfig,
      });
      return;
    }

    let parsedConfig: unknown = {};
    if (values.configText.trim()) {
      try {
        parsedConfig = JSON.parse(values.configText);
      } catch {
        setError("Le champ config doit être un JSON valide.");
        return;
      }
    }

    await onSubmit({
      ...values,
      configText: JSON.stringify(parsedConfig, null, 2),
      configOverride: parsedConfig,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-50">{title}</h2>
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Nom <span className="text-rose-400">*</span>
            </span>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              placeholder="Ex. Quiz de bienvenue"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Type
              </span>
              <select
                value={values.type}
                onChange={(e) => setValues((prev) => ({ ...prev, type: e.target.value as GameFromApi["type"] }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              >
                {ALLOWED_GAME_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Extra info
              </span>
              <input
                type="text"
                value={values.extraInfo}
                onChange={(e) => setValues((prev) => ({ ...prev, extraInfo: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
                placeholder="Infos supplémentaires sur le jeu (optionnel)"
              />
            </label>
          </div>

          {isQuiz ? (
            <QuizConfigBuilder value={quizConfig} onChange={setQuizConfig} />
          ) : (
            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Config JSON
              </span>
              <textarea
                rows={8}
                value={values.configText}
                onChange={(e) => setValues((prev) => ({ ...prev, configText: e.target.value }))}
                className="font-mono w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
                placeholder='Ex. {"steps":[{"question":"..."}]}'
              />
              <p className="text-[11px] text-slate-500">
                Pour le MVP, la configuration du jeu est éditée directement en JSON pour les autres types de jeux.
              </p>
            </label>
          )}

            {error && <p className="text-xs text-rose-300">{error}</p>}
          </div>

          <div className="flex flex-shrink-0 justify-end gap-2 border-t border-slate-800 px-5 py-3">
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

type ConfirmDeleteModalProps = {
  open: boolean;
  game?: GameFromApi | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
};

function ConfirmDeleteModal({ open, game, onConfirm, onClose, isSubmitting }: ConfirmDeleteModalProps) {
  if (!open || !game) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/95 p-5 text-sm text-slate-50 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <h2 className="text-sm font-semibold tracking-tight">Supprimer le jeu</h2>
        <p className="mt-2 text-xs text-slate-300">
          Es-tu sûr de vouloir supprimer le jeu{" "}
          <span className="font-semibold text-amber-200">{game.name}</span> ? Cette action est définitive.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/80"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center rounded-full bg-rose-500 px-4 py-1.5 text-xs font-semibold text-slate-50 shadow-[0_10px_30px_rgba(244,63,94,0.45)] hover:brightness-110 disabled:opacity-60"
            disabled={isSubmitting}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GamesPage() {
  const [items, setItems] = useState<GameFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<GameFormMode>("create");
  const [currentGame, setCurrentGame] = useState<GameFromApi | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<GameFromApi | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGames();
      setItems(data);
    } catch {
      setError("Impossible de charger les jeux depuis l’API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setFormMode("create");
    setCurrentGame(null);
    setIsFormOpen(true);
  };

  const openEdit = (game: GameFromApi) => {
    setFormMode("edit");
    setCurrentGame(game);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (values: GameFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: GamePayload = {
        name: values.name,
        type: values.type,
        extraInfo: values.extraInfo || null,
      };

      if (values.configOverride !== undefined) {
        payload.config = values.configOverride;
      } else {
        payload.config = values.configText ? JSON.parse(values.configText) : {};
      }

      if (formMode === "create") {
        await createGame(payload);
      } else if (currentGame) {
        await updateGame(currentGame.id, payload);
      }

      setIsFormOpen(false);
      await load();
    } catch {
      setError("Impossible d’enregistrer le jeu pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDelete = (game: GameFromApi) => {
    setGameToDelete(game);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!gameToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteGame(gameToDelete.id);
      setIsDeleteOpen(false);
      setGameToDelete(null);
      await load();
    } catch {
      setError("Impossible de supprimer le jeu pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">Games</h1>
          <p className="mt-1 text-sm text-slate-300">
            Gestion des mini-jeux (quiz, memory, puzzle). Le champ config est édité en JSON pour ce MVP.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(251,191,36,0.45)] hover:brightness-105"
        >
          Ajouter un jeu
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center border-b border-slate-800 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-slate-400">
          <div className="w-56">Nom</div>
          <div className="w-28">Type</div>
          <div className="flex-1">Extra info</div>
          <div className="w-40 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="px-4 py-6 text-sm text-slate-400">
            Chargement des jeux…
          </div>
        )}

        {!isLoading && error && (
          <div className="px-4 py-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {!isLoading && !error && !items.length && (
          <div className="px-4 py-6 text-sm text-slate-400">
            Aucun jeu pour le moment.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <ul className="divide-y divide-slate-800">
            {items.map((game) => (
              <li key={game.id} className="flex items-center px-4 py-3 text-sm text-slate-100">
                <div className="w-56 truncate">{game.name}</div>
                <div className="w-28 text-xs uppercase tracking-[0.14em] text-slate-300">{game.type}</div>
                <div className="flex-1 pr-4 text-xs text-slate-300 truncate">
                  {game.extraInfo || <span className="text-slate-500">–</span>}
                </div>
                <div className="flex w-40 justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(game)}
                    className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800/80"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => openDelete(game)}
                    className="inline-flex items-center rounded-full border border-rose-500/60 px-3 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-500/10"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <GameFormModal
        mode={formMode}
        open={isFormOpen}
        initialGame={currentGame}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />

      <ConfirmDeleteModal
        open={isDeleteOpen}
        game={gameToDelete}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setGameToDelete(null);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}


