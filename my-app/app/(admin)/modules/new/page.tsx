export default function NewModulePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-slate-50">
        Créer un module
      </h1>
      <p className="text-sm text-slate-300">
        Cette page servira à configurer un nouveau module (nom, description,
        vidéo, mini-jeu…). Pour l’instant, elle est en mode placeholder.
      </p>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
        La création et l’édition complètes des modules seront branchées à
        l’API dans une prochaine itération.
      </div>
    </div>
  );
}

