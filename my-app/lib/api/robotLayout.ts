const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export type RobotLayoutVariantFromApi = {
  id: string;
  color: string;
  imageUrl: string;
};

export type RobotLayoutPartFromApi = {
  id: string;
  partName: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  zIndex: number;
  variants?: RobotLayoutVariantFromApi[];
};

export type RobotLayoutSaveItem = {
  id: string;
  x: number;
  y: number;
};

export async function fetchRobotLayout(): Promise<RobotLayoutPartFromApi[]> {
  const res = await fetch(`${API_BASE_URL}/api/robot-layout`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erreur API robot-layout: ${res.status}`);
  }

  return res.json();
}

export async function saveRobotLayout(layout: RobotLayoutSaveItem[]): Promise<void> {
  const updates = layout.map(async (item) => {
    const res = await fetch(`${API_BASE_URL}/api/robot-parts/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        position: {
          x: item.x,
          y: item.y,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Erreur sauvegarde robot-part ${item.id}: ${res.status}`);
    }
  });

  await Promise.all(updates);
}

