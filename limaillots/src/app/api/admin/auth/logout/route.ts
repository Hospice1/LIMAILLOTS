import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/server/admin-auth";
import { requireSameOriginRequest } from "@/lib/server/admin-guard";

export async function POST(request: Request) {
  const originCheck = requireSameOriginRequest(request);
  if (!originCheck.ok) {
    return originCheck.response;
  }
  await clearAdminSession();

  return NextResponse.json({
    ok: true,
    message: "Session admin fermee.",
  });
}
