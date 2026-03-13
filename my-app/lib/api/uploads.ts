const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function uploadFile(endpoint: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Erreur upload fichier (${endpoint}): ${res.status}`);
  }

  const json = (await res.json()) as { url: string };
  if (!json.url) {
    throw new Error("Réponse upload invalide: champ 'url' manquant");
  }
  return json.url;
}

// NOTE: Ces endpoints backend doivent être implémentés côté Node/Express.
// - POST /api/uploads/module-image
// - POST /api/uploads/module-audio
// - POST /api/uploads/robot-part-variant-image

export async function uploadModuleImage(file: File): Promise<string> {
  return uploadFile("/api/uploads/module-image", file);
}

export async function uploadModuleAudio(file: File): Promise<string> {
  return uploadFile("/api/uploads/module-audio", file);
}

export async function uploadRobotPartVariantImage(file: File): Promise<string> {
  return uploadFile("/api/uploads/robot-part-variant-image", file);
}

