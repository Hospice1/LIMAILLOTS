import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/admin-auth";
import { getAdminDatabase, isDatabaseBackedStore } from "@/lib/server/admin-store";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      databaseBacked: await isDatabaseBackedStore(),
    });
  }

  const adminDb = await getAdminDatabase();

  return NextResponse.json({
    authenticated: true,
    settings: adminDb.settings,
    databaseBacked: await isDatabaseBackedStore(),
  });
}
