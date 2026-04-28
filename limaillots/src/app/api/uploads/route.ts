import { NextResponse } from "next/server";
import { uploadImageFilesToBlob } from "@/lib/server/blob-upload";

const DEFAULT_FOLDER = "uploads";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const folder = (formData.get("folder")?.toString().trim() || DEFAULT_FOLDER)
      .replace(/[^a-z0-9/_-]/gi, "-")
      .replace(/\/+/g, "/");

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ ok: false, message: "Aucun fichier fourni." }, { status: 400 });
    }

    const urls = await uploadImageFilesToBlob(files, folder);

    return NextResponse.json({ ok: true, urls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload impossible.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
