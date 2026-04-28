import { put } from "@vercel/blob";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

function sanitizePart(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "image";
}

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.trim();
  if (fromName && fromName.length <= 5) {
    return fromName.toLowerCase();
  }

  const match = file.type.match(/image\/(jpeg|jpg|png|webp|avif|gif)/i);
  if (match?.[1]) {
    return match[1].toLowerCase().replace("jpeg", "jpg");
  }

  return "jpg";
}

function buildPath(folder: string, file: File, index: number): string {
  const stamp = Date.now().toString(36);
  const base = sanitizePart(file.name.replace(/\.[^.]+$/, ""));
  const ext = getExtension(file);
  return `${folder}/${stamp}-${index}-${base}.${ext}`;
}

export async function uploadImageFilesToBlob(files: File[], folder: string): Promise<string[]> {
  const validFiles = files.filter((file) => file instanceof File && file.size > 0);

  if (validFiles.length === 0) {
    return [];
  }

  const urls: string[] = [];

  for (const [index, file] of validFiles.entries()) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Seules les images sont autorisees.");
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error("Chaque image doit faire moins de 5 Mo.");
    }

    const uploaded = await put(buildPath(folder, file, index), file, {
      access: "public",
      addRandomSuffix: true,
    });

    urls.push(uploaded.url);
  }

  return urls;
}
