import { NextResponse } from "next/server";
import { requestClientPasswordReset } from "@/lib/server/password-reset";

interface RecoveryBody {
  email?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RecoveryBody;
  const email = body.email?.trim() ?? "";

  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        message: "Email requis.",
      },
      { status: 400 },
    );
  }

  const origin = request.headers.get("origin") ?? undefined;
  const result = await requestClientPasswordReset({ email, requestOrigin: origin });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}