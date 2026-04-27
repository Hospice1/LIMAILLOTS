import { NextResponse } from "next/server";

interface RecoveryBody {
  email?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RecoveryBody;
  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        message: "Email requis.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Demande de recuperation recue. Si le compte existe, un email sera envoye.",
  });
}
