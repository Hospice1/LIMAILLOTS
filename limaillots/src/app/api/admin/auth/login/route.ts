import { NextResponse } from "next/server";
import { establishAdminSession } from "@/lib/server/admin-auth";
import { requireSameOriginRequest } from "@/lib/server/admin-guard";
import { authenticateAdminPassword } from "@/lib/server/admin-store";

interface LoginBody {
  password?: string;
}

export async function POST(request: Request) {
  const originCheck = requireSameOriginRequest(request);
  if (!originCheck.ok) {
    return originCheck.response;
  }
  const body = (await request.json()) as LoginBody;
  const password = body.password?.trim() ?? "";

  if (!password) {
    return NextResponse.json(
      {
        ok: false,
        message: "Mot de passe requis.",
      },
      { status: 400 },
    );
  }

  const authResult = await authenticateAdminPassword(password);

  if (!authResult.valid || !authResult.adminUserId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Mot de passe invalide.",
      },
      { status: 401 },
    );
  }

  await establishAdminSession(authResult.adminUserId);

  return NextResponse.json({
    ok: true,
    message: "Connexion admin reussie.",
  });
}
