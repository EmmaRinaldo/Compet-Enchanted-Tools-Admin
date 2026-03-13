type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditModulePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-slate-50">
        Modifier le module
      </h1>
      <p className="text-sm text-slate-300">
        Édition du module ID&nbsp;
        <span className="font-mono text-slate-200">{id}</span>. Cette page
        affichera plus tard un formulaire complet connecté à l&apos;API.
      </p>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
        Placeholder : les champs de formulaire (nom, description, vidéo,
        mini-jeu, etc.) seront ajoutés et branchés aux routes backend dans une
        prochaine étape.
      </div>
    </div>
  );
}

