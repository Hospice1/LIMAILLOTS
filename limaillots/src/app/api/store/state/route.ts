import { NextResponse } from "next/server";
import { getPublicStoreState, isDatabaseBackedStore } from "@/lib/server/admin-store";

export async function GET() {
  const state = await getPublicStoreState();

  return NextResponse.json({
    ok: true,
    databaseBacked: await isDatabaseBackedStore(),
    data: state,
  });
}
