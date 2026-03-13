const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export type RobotPartFromApi = {
  id: string;
  partName: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchRobotParts(): Promise<RobotPartFromApi[]> {
  const res = await fetch(`${API_BASE_URL}/api/robot-parts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erreur API robot-parts: ${res.status}`);
  }

  return res.json();
}
