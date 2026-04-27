import { NextResponse } from "next/server";
import { addClientReview } from "@/lib/server/admin-store";
import { getClientSession } from "@/lib/server/client-auth";
import { findClientUserById } from "@/lib/server/client-users";

interface ReviewBody {
  fullName?: string;
  email?: string;
  rating?: number;
  comment?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewBody;
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
