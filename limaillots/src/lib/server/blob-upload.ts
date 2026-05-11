const MAX_IMAGE_UPLOAD_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_SIZE = 150 * 1024 * 1024;

export interface UploadedMediaFile {
  url: string;
  kind: "image" | "video";
}

function getKind(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}

function getMaxSize(file: File): number {
  return file.type.startsWith("video/") ? MAX_VIDEO_UPLOAD_SIZE : MAX_IMAGE_UPLOAD_SIZE;
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || (file.type.startsWith("video/") ? "video/mp4" : "image/jpeg");
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function uploadMediaFilesToBlob(files: File[], folder: string): Promise<UploadedMediaFile[]> {
  void folder;

  const validFiles = files.filter((file) => file instanceof File && file.size > 0);
  if (validFiles.length === 0) {
    return [];
  }

  const uploadedFiles: UploadedMediaFile[] = [];

  for (const file of validFiles) {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      throw new Error("Seules les images et videos sont autorisees.");
    }

    if (file.size > getMaxSize(file)) {
      throw new Error(file.type.startsWith("video/") ? "Chaque video doit faire moins de 150 Mo." : "Chaque image doit faire moins de 8 Mo.");
    }

    uploadedFiles.push({
      url: await fileToDataUrl(file),
      kind: getKind(file),
    });
  }

  return uploadedFiles;
}

export async function uploadImageFilesToBlob(files: File[], folder: string): Promise<string[]> {
  const uploaded = await uploadMediaFilesToBlob(files, folder);
  void folder;
  return uploaded.filter((item) => item.kind === "image").map((item) => item.url);
}
