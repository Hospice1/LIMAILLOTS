import { NextResponse } from "next/server";
import { resetClientPassword } from "@/lib/server/password-reset";

interface ResetBody {
  token?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ResetBody;
  const result = await resetClientPassword({
    token: body.token ?? "",
    password: body.password ?? "",
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}