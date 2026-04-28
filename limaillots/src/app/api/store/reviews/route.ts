import { NextResponse } from "next/server";
import { addClientReview } from "@/lib/server/admin-store";
import { uploadImageFilesToBlob } from "@/lib/server/blob-upload";
import { getClientSession } from "@/lib/server/client-auth";
import { findClientUserById } from "@/lib/server/client-users";

interface ReviewBody {
  fullName?: string;
  email?: string;
  rating?: number | string;
  comment?: string;
  photos?: string[];
}

const MAX_REVIEW_PHOTOS = 4;
const MAX_REVIEW_PHOTO_SIZE = 4 * 1024 * 1024;



async function parseReviewPayload(request: Request): Promise<ReviewBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const rawPhotos = formData
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0)
      .slice(0, MAX_REVIEW_PHOTOS);

    for (const file of rawPhotos) {
      if (!file.type.startsWith("image/")) {
        throw new Error("Seules les images sont autorisees.");
      }

      if (file.size > MAX_REVIEW_PHOTO_SIZE) {
        throw new Error("Chaque photo doit faire moins de 4 Mo.");
      }
    }

    return {
      fullName: formData.get("fullName")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      rating: formData.get("rating")?.toString() ?? "5",
      comment: formData.get("comment")?.toString() ?? "",
      photos: await uploadImageFilesToBlob(rawPhotos, "reviews"),
    };
  }

  return (await request.json()) as ReviewBody;
}

export async function POST(request: Request) {
  let body: ReviewBody;

  try {
    body = await parseReviewPayload(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fichier invalide.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const session = await getClientSession();

  let fullName = body.fullName?.trim() ?? "";
  let email = body.email?.trim() ?? "";

  if (session) {
    const user = await findClientUserById(session.sub);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Compte client introuvable." }, { status: 401 });
    }

    fullName = user.fullName;
    email = user.email;
  }

  if (!fullName || !email) {
    return NextResponse.json(
      {
        ok: false,
        message: "Nom et email requis pour envoyer un avis.",
      },
      { status: 400 },
    );
  }

  const rating = Number(body.rating ?? 5);
  const comment = body.comment?.trim() ?? "";
  const photos = Array.isArray(body.photos) ? body.photos.slice(0, MAX_REVIEW_PHOTOS) : [];

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      {
        ok: false,
        message: "Note invalide.",
      },
      { status: 400 },
    );
  }

  if (!comment) {
    return NextResponse.json(
      {
        ok: false,
        message: "Commentaire requis.",
      },
      { status: 400 },
    );
  }

  const result = await addClientReview({
    fullName,
    email,
    rating,
    comment,
    photos,
    productId: "site-review",
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
  });
}


