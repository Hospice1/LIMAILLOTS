import { NextResponse } from "next/server";
import { replaceAdminState, getAdminDatabase, isDatabaseBackedStore } from "@/lib/server/admin-store";
import { requireAdminSession, requireSameOriginRequest } from "@/lib/server/admin-guard";

export async function GET() {
  const session = await requireAdminSession();
  if (!session.ok) {
    return session.response;
  }

  const adminDb = await getAdminDatabase();

  return NextResponse.json({
    ok: true,
    databaseBacked: await isDatabaseBackedStore(),
    data: adminDb,
  });
}

export async function PUT(request: Request) {
  const originCheck = requireSameOriginRequest(request);
  if (!originCheck.ok) {
    return originCheck.response;
  }
  const session = await requireAdminSession();
  if (!session.ok) {
    return session.response;
  }

  const payload = (await request.json()) as unknown;
  const nextData = await replaceAdminState(payload);

  return NextResponse.json({
    ok: true,
    databaseBacked: await isDatabaseBackedStore(),
    data: nextData,
  });
}
