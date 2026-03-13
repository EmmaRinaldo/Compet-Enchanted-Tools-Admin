const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export type ModuleListItem = {
  id: string;
  number: number;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  gameId?: string | null;
  robotPart?: string | null;
  isActive?: boolean;
};

export type ModulePayload = {
  number?: number;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  gameId?: string;
  robotPart?: string;
  isActive?: boolean;
};

export async function fetchModulesForList(): Promise<ModuleListItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/modules`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erreur API modules: ${res.status}`);
  }

  return res.json();
}

export async function createModule(payload: ModulePayload): Promise<ModuleListItem> {
  const res = await fetch(`${API_BASE_URL}/api/modules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Erreur création module: ${res.status}`);
  }

  return res.json();
}

export async function updateModule(id: string, payload: Partial<ModulePayload>): Promise<ModuleListItem> {
  const res = await fetch(`${API_BASE_URL}/api/modules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Erreur mise à jour module: ${res.status}`);
  }

  return res.json();
}

export async function deleteModule(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/modules/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Erreur suppression module: ${res.status}`);
  }
}

export type ModulesOrderItem = {
  id: string;
  number: number;
};

export async function saveModulesOrder(order: ModulesOrderItem[]): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/modules/order`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });

  if (!res.ok) {
    throw new Error(`Erreur enregistrement ordre modules: ${res.status}`);
  }
}


