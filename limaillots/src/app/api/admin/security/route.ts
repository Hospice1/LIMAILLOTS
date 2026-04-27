import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-guard";
import { updateAdminSecurity } from "@/lib/server/admin-store";

interface SecurityBody {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  recoveryEmail?: string;
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session.ok) {
    return session.response;
  }

  const body = (await request.json()) as SecurityBody;

  const currentPassword = body.currentPassword?.trim() ?? "";
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";
  const recoveryEmail = body.recoveryEmail ?? "";

  if (!currentPassword) {
    return NextResponse.json(
      {
        ok: false,
        message: "Mot de passe actuel requis.",
      },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      {
        ok: false,
        message: "La confirmation du mot de passe est incorrecte.",
      },
      { status: 400 },
    );
  }

  const result = await updateAdminSecurity({
    currentPassword,
    newPassword,
    recoveryEmail,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
