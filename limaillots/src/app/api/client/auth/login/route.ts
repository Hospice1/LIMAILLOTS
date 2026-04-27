import { NextResponse } from "next/server";
import { establishClientSession } from "@/lib/server/client-auth";
import { ensureClientProfile } from "@/lib/server/admin-store";
import { authenticateClientUser } from "@/lib/server/client-users";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      {
        ok: false,
        message: "Email et mot de passe requis.",
      },
      { status: 400 },
    );
  }

  const authResult = await authenticateClientUser({ email, password });

  if (!authResult.ok || !authResult.user) {
    return NextResponse.json(
      {
        ok: false,
        message: authResult.message,
      },
      { status: 401 },
    );
  }

  await establishClientSession(authResult.user.id);
  await ensureClientProfile({
    email: authResult.user.email,
    fullName: authResult.user.fullName,
    phone: authResult.user.phone,
    city: authResult.user.city,
  });

  return NextResponse.json({
    ok: true,
    message: "Connexion reussie.",
  });
}
