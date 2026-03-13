"use client";

import { useState, type ChangeEvent } from "react";
import { uploadModuleImage } from "@/lib/api/uploads";

export type QuizAnswer = {
  id: string;
  type: "text" | "image";
  value: string;
  isCorrect: boolean;
};

export type QuizStep = {
  id: string;
  question: string;
  image: string;
  extraInfo: string;
  answers: QuizAnswer[];
};

export type QuizConfig = {
  steps: QuizStep[];
};

type QuizConfigBuilderProps = {
  value: QuizConfig;
  onChange: (value: QuizConfig) => void;
};

type QuizStepEditorProps = {
  step: QuizStep;
  index: number;
  onChange: (step: QuizStep) => void;
  onRemove: () => void;
};

type QuizAnswerEditorProps = {
  answer: QuizAnswer;
  index: number;
  onChange: (answer: QuizAnswer) => void;
  onRemove: () => void;
  onMakeCorrect: () => void;
};

function createEmptyAnswer(): QuizAnswer {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: "text",
    value: "",
    isCorrect: false,
  };
}

function createEmptyStep(): QuizStep {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    question: "",
    image: "",
    extraInfo: "",
    answers: [createEmptyAnswer(), createEmptyAnswer()],
  };
}

function QuizAnswerEditor({ answer, index, onChange, onRemove, onMakeCorrect }: QuizAnswerEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const url = await uploadModuleImage(file);
      onChange({ ...answer, value: url });
    } catch {
      setUploadError("Impossible d’uploader l’image pour le moment.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
      <div className="flex flex-col gap-1 text-[11px] text-slate-300">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Réponse {index + 1}</span>
        <select
          value={answer.type}
          onChange={(e) => onChange({ ...answer, type: e.target.value as QuizAnswer["type"] })}
          className="w-24 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
        >
          <option value="text">Texte</option>
          <option value="image">Image</option>
        </select>
      </div>

      <div className="flex-1 space-y-1">
        {answer.type === "text" ? (
          <input
            type="text"
            value={answer.value}
            onChange={(e) => onChange({ ...answer, value: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
            placeholder="Texte de la réponse"
          />
        ) : (
          <div className="space-y-1">
            {answer.value && (
              <p className="break-all text-[11px] text-slate-400">
                Image sélectionnée: <span className="text-slate-200">{answer.value}</span>
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-[11px] text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-slate-50 hover:file:bg-slate-700"
              disabled={isUploading}
            />
            {isUploading && (
              <p className="text-[11px] text-slate-400">Upload de l’image en cours…</p>
            )}
            {uploadError && <p className="text-[11px] text-rose-300">{uploadError}</p>}
          </div>
        )}
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <button
            type="button"
            onClick={onMakeCorrect}
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              answer.isCorrect
                ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                : "border-slate-700 text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            {answer.isCorrect ? "Bonne réponse" : "Marquer comme bonne"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] text-rose-300 hover:text-rose-200"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizStepEditor({ step, index, onChange, onRemove }: QuizStepEditorProps) {
  const [isAnswersOpen, setIsAnswersOpen] = useState(true);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const updateStep = (partial: Partial<QuizStep>) => {
    onChange({ ...step, ...partial });
  };

  const updateAnswerAt = (answerIndex: number, next: QuizAnswer) => {
    const answers = step.answers.slice();
    answers[answerIndex] = next;
    updateStep({ answers });
  };

  const addAnswer = () => {
    updateStep({ answers: [...step.answers, createEmptyAnswer()] });
  };

  const removeAnswerAt = (answerIndex: number) => {
    const answers = step.answers.filter((_, i) => i !== answerIndex);
    updateStep({ answers });
  };

  const makeCorrect = (answerIndex: number) => {
    const answers = step.answers.map((a, i) => ({
      ...a,
      isCorrect: i === answerIndex,
    }));
    updateStep({ answers });
  };

  const handleStepImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadError(null);
    try {
      const url = await uploadModuleImage(file);
      updateStep({ image: url });
    } catch {
      setImageUploadError("Impossible d’uploader l’image de l’étape pour le moment.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Étape {index + 1}
            </span>
            <button
              type="button"
              onClick={() => setIsAnswersOpen((prev) => !prev)}
              className="text-[10px] text-slate-400 hover:text-slate-200"
            >
              {isAnswersOpen ? "Replier" : "Déplier"}
            </button>
          </div>
          <input
            type="text"
            value={step.question}
            onChange={(e) => updateStep({ question: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
            placeholder="Question de l’étape"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="mt-4 text-[11px] text-rose-300 hover:text-rose-200"
        >
          Supprimer l’étape
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Image (optionnelle)
          </span>
          <div className="space-y-1">
            {step.image && (
              <p className="break-all text-[11px] text-slate-400">
                Image sélectionnée: <span className="text-slate-200">{step.image}</span>
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleStepImageFileChange}
              className="block w-full text-[11px] text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-slate-50 hover:file:bg-slate-700"
              disabled={isUploadingImage}
            />
            {isUploadingImage && (
              <p className="text-[11px] text-slate-400">Upload de l’image en cours…</p>
            )}
            {imageUploadError && <p className="text-[11px] text-rose-300">{imageUploadError}</p>}
          </div>
        </label>
        <label className="space-y-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Info supplémentaire (optionnelle)
          </span>
          <input
            type="text"
            value={step.extraInfo}
            onChange={(e) => updateStep({ extraInfo: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
            placeholder="Texte affiché après la bonne réponse"
          />
        </label>
      </div>

      {isAnswersOpen && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Réponses (au moins 2)
            </span>
            <button
              type="button"
              onClick={addAnswer}
              className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-[10px] font-medium text-slate-100 hover:bg-slate-800/80"
            >
              Ajouter une réponse
            </button>
          </div>

          <div className="space-y-2">
            {step.answers.map((answer, i) => (
              <QuizAnswerEditor
                key={answer.id}
                answer={answer}
                index={i}
                onChange={(next) => updateAnswerAt(i, next)}
                onRemove={() => removeAnswerAt(i)}
                onMakeCorrect={() => makeCorrect(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuizConfigBuilder({ value, onChange }: QuizConfigBuilderProps) {
  const addStep = () => {
    onChange({
      steps: [...value.steps, createEmptyStep()],
    });
  };

  const updateStepAt = (index: number, step: QuizStep) => {
    const steps = value.steps.slice();
    steps[index] = step;
    onChange({ steps });
  };

  const removeStepAt = (index: number) => {
    const steps = value.steps.filter((_, i) => i !== index);
    onChange({ steps });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Étapes du quiz
          </span>
          <p className="mt-1 text-[11px] text-slate-500">
            Ajoute des étapes avec leurs réponses. Une seule réponse correcte par étape.
          </p>
        </div>
        <button
          type="button"
          onClick={addStep}
          className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800/80"
        >
          Ajouter une étape
        </button>
      </div>

      {value.steps.length === 0 && (
        <p className="text-[11px] text-slate-500">
          Aucun écran de quiz pour le moment. Clique sur &quot;Ajouter une étape&quot; pour commencer.
        </p>
      )}

      <div className="space-y-3">
        {value.steps.map((step, index) => (
          <QuizStepEditor
            key={step.id}
            step={step}
            index={index}
            onChange={(next) => updateStepAt(index, next)}
            onRemove={() => removeStepAt(index)}
          />
        ))}
      </div>
    </div>
  );
}

