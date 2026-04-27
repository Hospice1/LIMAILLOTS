import { NextResponse } from "next/server";
import { establishClientSession } from "@/lib/server/client-auth";
import { ensureClientProfile } from "@/lib/server/admin-store";
import { registerClientUser } from "@/lib/server/client-users";

interface RegisterBody {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
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

  const result = await registerClientUser({
    fullName,
    email,
    phone,
    city,
    password,
  });

  if (!result.ok || !result.user) {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
      },
      { status: 400 },
    );
  }

  await establishClientSession(result.user.id);
  await ensureClientProfile({
    email: result.user.email,
    fullName: result.user.fullName,
    phone: result.user.phone,
    city: result.user.city,
  });

  return NextResponse.json({
    ok: true,
    message: "Compte cree avec succes.",
  });
}
