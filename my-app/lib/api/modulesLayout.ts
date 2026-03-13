const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export type ModuleFromApi = {
  id: string;
  number: number;
  position?: {
    x?: number;
    y?: number;
  };
};

export type ModuleLayoutPayload = {
  id: string;
  x: number;
  y: number;
};

export async function fetchModulesForLayout(): Promise<ModuleFromApi[]> {
  const res = await fetch(`${API_BASE_URL}/api/modules`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Erreur API modules: ${res.status}`);
  }

  return res.json();
}

export async function saveModulesLayout(
  layout: ModuleLayoutPayload[],
): Promise<{ success: boolean; updatedCount: number }> {
  const res = await fetch(`${API_BASE_URL}/api/modules/layout`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ layout }),
  });

  if (!res.ok) {
    throw new Error(`Erreur API layout: ${res.status}`);
  }

  return res.json();
}

