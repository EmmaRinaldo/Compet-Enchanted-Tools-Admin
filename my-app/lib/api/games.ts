const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const ALLOWED_GAME_TYPES = ["quiz", "memory", "puzzle", "none"] as const;
export type GameType = (typeof ALLOWED_GAME_TYPES)[number];

export type GameFromApi = {
  id: string;
  name: string;
  type: GameType;
  config: unknown;
  extraInfo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GamePayload = {
  name: string;
  type: GameType;
  extraInfo?: string | null;
  config?: unknown;
};

export async function fetchGames(): Promise<GameFromApi[]> {
  const res = await fetch(`${API_BASE_URL}/api/games`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erreur API games: ${res.status}`);
  }

  return res.json();
}

export async function createGame(payload: GamePayload): Promise<GameFromApi> {
  const res = await fetch(`${API_BASE_URL}/api/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Erreur création jeu: ${res.status}`);
  }

  return res.json();
}

export async function updateGame(id: string, payload: Partial<GamePayload>): Promise<GameFromApi> {
  const res = await fetch(`${API_BASE_URL}/api/games/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Erreur mise à jour jeu: ${res.status}`);
  }

  return res.json();
}

export async function deleteGame(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/games/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Erreur suppression jeu: ${res.status}`);
  }
}

