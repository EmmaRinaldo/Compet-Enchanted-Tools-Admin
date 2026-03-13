"use client";

type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  itemLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmModal({
  open,
  title = "Confirmer la suppression",
  description = "Êtes-vous sûr de vouloir supprimer cet élément ?",
  itemLabel,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  isConfirming = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-50">
            {title}
          </h2>
        </header>
        <div className="space-y-2 px-5 py-4 text-sm text-slate-200">
          <p>{description}</p>
          {itemLabel && (
            <p className="text-xs text-slate-400">
              Élément&nbsp;: <span className="font-medium text-slate-100">{itemLabel}</span>
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/80"
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center rounded-full border border-rose-500/70 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-300 shadow-[0_0_25px_rgba(248,113,113,0.45)] hover:bg-rose-500/20 disabled:opacity-60"
            disabled={isConfirming}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

