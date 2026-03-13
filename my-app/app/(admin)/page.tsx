type Stats = {
  started: number;
  completed: number;
  completionRate: number;
};

// Placeholder pour le MVP : ces valeurs pourront venir plus tard d'une API analytics.
const MOCK_STATS: Stats = {
  started: 128,
  completed: 74,
  completionRate: 58,
};

export default function AdminDashboardPage() {
  const stats = MOCK_STATS;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Vue d’ensemble de l’expérience
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Cette interface permet à l’équipe Enchanted Tools de configurer le
          parcours Mirokaï (modules, carte, contenu) sans toucher au code.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">Visiteurs ayant commencé</p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {stats.started}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">Visiteurs ayant terminé</p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {stats.completed}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">Taux de complétion</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {stats.completionRate}%
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
            Actions rapides
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <a
              href="/modules"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-800/80"
            >
              Gérer les modules
            </a>
            <a
              href="/layout-editor"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-800/80"
            >
              Ouvrir le layout
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
            Prochaines étapes
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Brancher les vraies analytics anonymisées.</li>
            <li>Afficher une vue détaillée par module.</li>
            <li>Suivre les modifications du layout dans le temps.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}


