/* Page modules : MVP avec drag & drop HTML5, données mockées et placeholders API. */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ModuleListItem } from "@/lib/api/modules";
import {
  createModule,
  deleteModule,
  fetchModulesForList,
  saveModulesOrder,
  updateModule,
} from "@/lib/api/modules";
import { ModuleFormModal, type ModuleFormValues } from "@/components/ModuleFormModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

export default function ModulesListPage() {
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingModule, setEditingModule] = useState<ModuleListItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modulePendingDelete, setModulePendingDelete] = useState<ModuleListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadModules() {
      try {
        const data = await fetchModulesForList();
        if (!isMounted) return;

        // On trie par number pour garantir l’ordre, au cas où.
        const sorted = [...data].sort((a, b) => a.number - b.number);
        setModules(sorted);
      } catch (err) {
        if (!isMounted) return;
        setError("Impossible de charger les modules depuis l’API.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Chargement initial depuis l’API backend
    loadModules();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReorder = async (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const current = [...modules];
    const sourceIndex = current.findIndex((m) => m.id === sourceId);
    const targetIndex = current.findIndex((m) => m.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...current];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated: ModuleListItem[] = reordered.map((m, index) => ({
      ...m,
      number: index + 1,
    }));

    setModules(updated);

    try {
      const orderPayload = updated.map((m) => ({
        id: m.id,
        number: m.number,
      }));
      await saveModulesOrder(orderPayload);
    } catch {
      // TODO: éventuellement remonter une erreur UI si l’enregistrement échoue.
    }
  };

  const handleDelete = (id: string) => {
    const moduleToDelete = modules.find((m) => m.id === id);
    if (!moduleToDelete) return;

    setModulePendingDelete(moduleToDelete);
  };

  const confirmDeleteModule = async () => {
    if (!modulePendingDelete) return;

    setIsDeleting(true);

    try {
      await deleteModule(modulePendingDelete.id);
      setModules((current) => current.filter((m) => m.id !== modulePendingDelete.id));
    } finally {
      setIsDeleting(false);
      setModulePendingDelete(null);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingModule(null);
    setIsModalOpen(true);
  };

  const openEditModal = (module: ModuleListItem) => {
    setModalMode("edit");
    setEditingModule(module);
    setIsModalOpen(true);
  };

  const handleSubmitModule = async (values: ModuleFormValues) => {
    setIsSaving(true);

    try {
      if (modalMode === "create") {
        const created = await createModule({
          name: values.name,
          slug: values.slug || undefined,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          videoUrl: values.videoUrl || undefined,
          audioUrl: values.audioUrl || undefined,
          gameId: values.gameId || undefined,
          robotPart: values.robotPart || undefined,
          isActive: values.isActive,
        });

        setModules((current) => [...current, created].sort((a, b) => a.number - b.number));
      } else if (modalMode === "edit" && editingModule) {
        const updated = await updateModule(editingModule.id, {
          name: values.name,
          slug: values.slug || undefined,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          videoUrl: values.videoUrl || undefined,
          audioUrl: values.audioUrl || undefined,
          gameId: values.gameId || undefined,
          robotPart: values.robotPart || undefined,
          isActive: values.isActive,
        });

        setModules((current) =>
          current
            .map((m) => (m.id === updated.id ? updated : m))
            .sort((a, b) => a.number - b.number),
        );
      }

      setIsModalOpen(false);
      setEditingModule(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">
            Modules
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Liste des modules de l’expérience. Les données affichées sont
            actuellement des exemples mockés.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_30px_rgba(251,191,36,0.45)] hover:brightness-105"
        >
          Créer un module
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center border-b border-slate-800 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-slate-400">
          <div className="w-8" />
          <div className="w-12">#</div>
          <div className="flex-1">Nom</div>
          <div className="w-40 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="px-4 py-6 text-sm text-slate-400">
            Chargement des modules…
          </div>
        )}

        {!isLoading && error && (
          <div className="px-4 py-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {!isLoading && !error && !modules.length && (
          <div className="px-4 py-6 text-sm text-slate-400">
            Aucun module pour le moment. Utilise le bouton &laquo; Créer un module &raquo; pour commencer.
          </div>
        )}

        {!isLoading && !error && modules.length > 0 && (
          <ul className="divide-y divide-slate-800 text-sm">
            {modules.map((m) => {
              const isDragging = draggingId === m.id;
              const isDragOver = dragOverId === m.id && draggingId !== m.id;

              return (
                <li
                  key={m.id}
                  draggable
                  onDragStart={() => {
                    setDraggingId(m.id);
                    setDragOverId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggingId && draggingId !== m.id) {
                      setDragOverId(m.id);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggingId && draggingId !== m.id) {
                      handleReorder(draggingId, m.id);
                    }
                    setDragOverId(null);
                  }}
                  className={[
                    "flex items-center px-4 py-3 text-slate-100 transition",
                    isDragging ? "opacity-60" : "",
                    isDragOver ? "bg-slate-800/60" : "bg-transparent",
                  ].join(" ")}
                >
                  <div className="mr-2 flex w-8 justify-center text-slate-500">
                    <span className="cursor-grab text-lg leading-none" aria-hidden="true">
                      ⋮⋮
                    </span>
                  </div>
                  <div className="w-12 text-xs text-slate-300">#{m.number}</div>
                  <div className="flex-1">{m.name}</div>
                  <div className="flex w-40 justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => openEditModal(m)}
                    className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800/80"
                  >
                    Modifier
                  </button>
                    <button
                      type="button"
                    className="rounded-full border border-rose-500/60 px-3 py-1 text-rose-300 hover:bg-rose-500/10"
                      onClick={() => handleDelete(m.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-slate-500">
        Le réordonnancement par drag &amp; drop et l’édition/création via la
        modal sont synchronisés avec l’API modules (création, édition,
        suppression et sauvegarde de l’ordre).
      </p>

      <ModuleFormModal
        mode={modalMode}
        open={isModalOpen}
        onClose={() => {
          if (isSaving) return;
          setIsModalOpen(false);
          setEditingModule(null);
        }}
        isSubmitting={isSaving}
        initialValues={
          editingModule
            ? {
                number: editingModule.number,
                name: editingModule.name,
                slug: editingModule.slug ?? "",
                description: editingModule.description ?? "",
                imageUrl: editingModule.imageUrl ?? "",
                videoUrl: editingModule.videoUrl ?? "",
                audioUrl: editingModule.audioUrl ?? "",
                gameId: editingModule.gameId ?? "",
                robotPart: editingModule.robotPart ?? "",
                isActive: editingModule.isActive ?? true,
              }
            : undefined
        }
        onSubmit={handleSubmitModule}
      />

      <DeleteConfirmModal
        open={!!modulePendingDelete}
        onCancel={() => {
          if (isDeleting) return;
          setModulePendingDelete(null);
        }}
        onConfirm={confirmDeleteModule}
        isConfirming={isDeleting}
        title="Supprimer ce module ?"
        description="Êtes-vous sûr de vouloir supprimer ce module ? Cette action sera définitive une fois connectée à l’API."
        itemLabel={modulePendingDelete?.name}
      />
    </div>
  );
}

