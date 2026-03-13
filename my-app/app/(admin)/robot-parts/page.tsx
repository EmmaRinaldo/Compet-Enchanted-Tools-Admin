"use client";

import { useEffect, useState } from "react";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { uploadRobotPartVariantImage } from "@/lib/api/uploads";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

type RobotPart = {
  id: string;
  partName: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  zIndex: number;
};

type RobotPartVariant = {
  id: string;
  robotPartId: string;
  color: string;
  imageUrl: string;
};

type RobotPartFormValues = {
  partName: string;
  width: number | "";
  height: number | "";
  zIndex: number | "";
};

type VariantFormValues = {
  robotPartId: string;
  color: string;
  imageUrl: string;
};

export default function RobotPartsPage() {
  const [parts, setParts] = useState<RobotPart[]>([]);
  const [variants, setVariants] = useState<RobotPartVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<RobotPart | null>(null);
  const [isSavingPart, setIsSavingPart] = useState(false);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<RobotPartVariant | null>(null);
  const [variantPartId, setVariantPartId] = useState<string | null>(null);
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  const [pendingDeletePart, setPendingDeletePart] = useState<RobotPart | null>(null);
  const [pendingDeleteVariant, setPendingDeleteVariant] = useState<RobotPartVariant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [partsRes, variantsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/robot-parts`, { cache: "no-store" }),
          fetch(`${API_BASE_URL}/api/robot-part-variants`, { cache: "no-store" }),
        ]);

        if (!partsRes.ok) throw new Error(`Erreur API robot-parts: ${partsRes.status}`);
        if (!variantsRes.ok) throw new Error(`Erreur API robot-part-variants: ${variantsRes.status}`);

        const partsJson = (await partsRes.json()) as RobotPart[];
        const variantsJson = (await variantsRes.json()) as RobotPartVariant[];

        if (!cancelled) {
          setParts(partsJson);
          setVariants(variantsJson);
        }
      } catch {
        if (!cancelled) setError("Impossible de charger les données robot depuis l’API.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const openCreatePartModal = () => {
    setEditingPart(null);
    setIsPartModalOpen(true);
  };

  const openEditPartModal = (part: RobotPart) => {
    setEditingPart(part);
    setIsPartModalOpen(true);
  };

  const openCreateVariantModal = (partId: string) => {
    setVariantPartId(partId);
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  };

  const openEditVariantModal = (variant: RobotPartVariant) => {
    setVariantPartId(variant.robotPartId);
    setEditingVariant(variant);
    setIsVariantModalOpen(true);
  };

  const handleSavePart = async (values: RobotPartFormValues) => {
    setIsSavingPart(true);
    try {
      const payload = {
        partName: values.partName,
        width: typeof values.width === "number" ? values.width : 0,
        height: typeof values.height === "number" ? values.height : 0,
        zIndex: typeof values.zIndex === "number" ? values.zIndex : 0,
      };

      if (editingPart) {
        const res = await fetch(`${API_BASE_URL}/api/robot-parts/${editingPart.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Erreur update robot-part: ${res.status}`);
        const updated = (await res.json()) as RobotPart;
        setParts((current) => current.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const res = await fetch(`${API_BASE_URL}/api/robot-parts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            position: { x: 50, y: 50 },
          }),
        });
        if (!res.ok) throw new Error(`Erreur création robot-part: ${res.status}`);
        const created = (await res.json()) as RobotPart;
        setParts((current) => [...current, created]);
      }

      setIsPartModalOpen(false);
      setEditingPart(null);
    } finally {
      setIsSavingPart(false);
    }
  };

  const handleSaveVariant = async (values: VariantFormValues) => {
    if (!variantPartId) return;
    setIsSavingVariant(true);
    try {
      const payload = {
        robotPartId: values.robotPartId || variantPartId,
        color: values.color,
        imageUrl: values.imageUrl,
      };

      if (editingVariant) {
        const res = await fetch(`${API_BASE_URL}/api/robot-part-variants/${editingVariant.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Erreur update robot-part-variant: ${res.status}`);
        const updated = (await res.json()) as RobotPartVariant;
        setVariants((current) => current.map((v) => (v.id === updated.id ? updated : v)));
      } else {
        const res = await fetch(`${API_BASE_URL}/api/robot-part-variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Erreur création robot-part-variant: ${res.status}`);
        const created = (await res.json()) as RobotPartVariant;
        setVariants((current) => [...current, created]);
      }

      setIsVariantModalOpen(false);
      setEditingVariant(null);
      setVariantPartId(null);
    } finally {
      setIsSavingVariant(false);
    }
  };

  const confirmDeletePart = async () => {
    if (!pendingDeletePart) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_BASE_URL}/api/robot-parts/${pendingDeletePart.id}`, { method: "DELETE" });
      setParts((current) => current.filter((p) => p.id !== pendingDeletePart.id));
      setVariants((current) => current.filter((v) => v.robotPartId !== pendingDeletePart.id));
      setPendingDeletePart(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteVariant = async () => {
    if (!pendingDeleteVariant) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_BASE_URL}/api/robot-part-variants/${pendingDeleteVariant.id}`, {
        method: "DELETE",
      });
      setVariants((current) => current.filter((v) => v.id !== pendingDeleteVariant.id));
      setPendingDeleteVariant(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">Robot Parts</h1>
          <p className="mt-1 text-sm text-slate-300">
            Gestion des parties du robot et de leurs variantes visuelles.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreatePartModal}
          className="inline-flex items-center rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(251,191,36,0.45)] hover:brightness-105"
        >
          Ajouter une partie
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center border-b border-slate-800 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-slate-400">
          <div className="w-32">Part</div>
          <div className="w-40">Position</div>
          <div className="w-32">Dimensions</div>
          <div className="w-20">Z</div>
          <div className="flex-1">Variantes</div>
          <div className="w-40 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="px-4 py-6 text-sm text-slate-400">
            Chargement des parties du robot…
          </div>
        )}

        {!isLoading && error && (
          <div className="px-4 py-4 text-sm text-rose-300">{error}</div>
        )}

        {!isLoading && !error && parts.length === 0 && (
          <div className="px-4 py-6 text-sm text-slate-400">
            Aucune partie pour le moment. Utilise le bouton &laquo; Ajouter une partie &raquo; pour
            commencer.
          </div>
        )}

        {!isLoading && !error && parts.length > 0 && (
          <ul className="divide-y divide-slate-800 text-sm">
            {parts.map((part) => {
              const partVariants = variants.filter((v) => v.robotPartId === part.id);
              return (
                <li key={part.id} className="px-4 py-3 text-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-32 text-xs text-slate-300">{part.partName}</div>
                    <div className="w-40 text-xs text-slate-300">
                      x: {part.position.x ?? "-"}, y: {part.position.y ?? "-"}
                    </div>
                    <div className="w-32 text-xs text-slate-300">
                      {part.width} × {part.height}
                    </div>
                    <div className="w-20 text-xs text-slate-300">{part.zIndex}</div>
                    <div className="flex-1 text-xs text-slate-300">
                      {partVariants.length === 0 ? (
                        <span className="text-slate-500">Aucune variante</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {partVariants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => openEditVariantModal(v)}
                              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-200 hover:bg-slate-800/80"
                            >
                              <span
                                className="mr-1 inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: v.color }}
                              />
                              {v.color}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex w-40 justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => openCreateVariantModal(part.id)}
                        className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800/80"
                      >
                        + Variante
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditPartModal(part)}
                        className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800/80"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeletePart(part)}
                        className="rounded-full border border-rose-500/60 px-3 py-1 text-rose-300 hover:bg-rose-500/10"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Modal Part */}
      <RobotPartFormModal
        open={isPartModalOpen}
        onClose={() => {
          if (isSavingPart) return;
          setIsPartModalOpen(false);
          setEditingPart(null);
        }}
        isSubmitting={isSavingPart}
        initialValues={
          editingPart
            ? {
                partName: editingPart.partName,
                width: editingPart.width,
                height: editingPart.height,
                zIndex: editingPart.zIndex,
              }
            : undefined
        }
        onSubmit={handleSavePart}
      />

      {/* Modal Variant */}
      {isVariantModalOpen && variantPartId && (
        <RobotPartVariantFormModal
          open={isVariantModalOpen}
          onClose={() => {
            if (isSavingVariant) return;
            setIsVariantModalOpen(false);
            setEditingVariant(null);
            setVariantPartId(null);
          }}
          isSubmitting={isSavingVariant}
          initialValues={
            editingVariant
              ? {
                  robotPartId: editingVariant.robotPartId,
                  color: editingVariant.color,
                  imageUrl: editingVariant.imageUrl,
                }
              : { robotPartId: variantPartId, color: "", imageUrl: "" }
          }
          onSubmit={handleSaveVariant}
        />
      )}

      {/* Delete modals */}
      <DeleteConfirmModal
        open={!!pendingDeletePart}
        onCancel={() => {
          if (isDeleting) return;
          setPendingDeletePart(null);
        }}
        onConfirm={confirmDeletePart}
        isConfirming={isDeleting}
        title="Supprimer cette partie ?"
        description="Êtes-vous sûr de vouloir supprimer cette partie du robot ? Les variantes associées seront également supprimées."
        itemLabel={pendingDeletePart?.partName}
      />

      <DeleteConfirmModal
        open={!!pendingDeleteVariant}
        onCancel={() => {
          if (isDeleting) return;
          setPendingDeleteVariant(null);
        }}
        onConfirm={confirmDeleteVariant}
        isConfirming={isDeleting}
        title="Supprimer cette variante ?"
        description="Êtes-vous sûr de vouloir supprimer cette variante visuelle ?"
        itemLabel={pendingDeleteVariant?.color}
      />
    </div>
  );
}

type RobotPartFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RobotPartFormValues) => Promise<void> | void;
  initialValues?: Partial<RobotPartFormValues>;
  isSubmitting?: boolean;
};

function RobotPartFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
}: RobotPartFormModalProps) {
  const [values, setValues] = useState<RobotPartFormValues>({
    partName: initialValues?.partName ?? "",
    width: initialValues?.width ?? "",
    height: initialValues?.height ?? "",
    zIndex: initialValues?.zIndex ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setValues({
      partName: initialValues?.partName ?? "",
      width: initialValues?.width ?? "",
      height: initialValues?.height ?? "",
      zIndex: initialValues?.zIndex ?? "",
    });
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange =
    (field: keyof RobotPartFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((prev) => {
        if (field === "width" || field === "height" || field === "zIndex") {
          if (value === "") return { ...prev, [field]: "" };
          const parsed = Number(value);
          if (Number.isNaN(parsed)) return prev;
          return { ...prev, [field]: parsed };
        }
        return { ...prev, [field]: value };
      });
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.partName.trim()) {
      setError("Le nom de la partie est obligatoire.");
      return;
    }

    if (values.width === "" || values.height === "" || values.zIndex === "") {
      setError("Width, height et zIndex sont obligatoires.");
      return;
    }

    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-50">
            {initialValues?.partName ? "Modifier la partie" : "Ajouter une partie"}
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
          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Nom de la partie
            </span>
            <input
              type="text"
              value={values.partName}
              onChange={handleChange("partName")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              placeholder="Ex. head, torso…"
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Width
              </span>
              <input
                type="number"
                value={values.width}
                onChange={handleChange("width")}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Height
              </span>
              <input
                type="number"
                value={values.height}
                onChange={handleChange("height")}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Z-index
              </span>
              <input
                type="number"
                value={values.zIndex}
                onChange={handleChange("zIndex")}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              />
            </label>
          </div>

          {error && <p className="text-xs text-rose-300">{error}</p>}

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
              {initialValues?.partName ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type RobotPartVariantFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: VariantFormValues) => Promise<void> | void;
  initialValues?: VariantFormValues;
  isSubmitting?: boolean;
};

function RobotPartVariantFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
}: RobotPartVariantFormModalProps) {
  const [values, setValues] = useState<VariantFormValues>({
    robotPartId: initialValues?.robotPartId ?? "",
    color: initialValues?.color ?? "",
    imageUrl: initialValues?.imageUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setValues({
      robotPartId: initialValues?.robotPartId ?? "",
      color: initialValues?.color ?? "",
      imageUrl: initialValues?.imageUrl ?? "",
    });
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange =
    (field: keyof VariantFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadRobotPartVariantImage(file);
      setValues((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      setError("Impossible d’uploader l’image de la variante pour le moment.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.robotPartId) {
      setError("robotPartId est obligatoire.");
      return;
    }
    if (!values.color.trim()) {
      setError("La couleur est obligatoire.");
      return;
    }
    if (!values.imageUrl.trim()) {
      setError("L’URL d’image est obligatoire.");
      return;
    }

    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-50">
            {initialValues ? "Modifier la variante" : "Ajouter une variante"}
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
          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              robotPartId
            </span>
            <input
              type="text"
              value={values.robotPartId}
              onChange={handleChange("robotPartId")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Couleur
            </span>
            <input
              type="text"
              value={values.color}
              onChange={handleChange("color")}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              placeholder="Ex. orange, blue, grey…"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Image URL
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
                disabled={isUploading || isSubmitting}
              />
              {isUploading && (
                <p className="text-[11px] text-slate-400">Upload de l’image en cours…</p>
              )}
            </div>
          </label>

          {error && <p className="text-xs text-rose-300">{error}</p>}

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
              {initialValues ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


