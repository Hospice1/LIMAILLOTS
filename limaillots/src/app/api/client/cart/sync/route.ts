import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/server/client-auth";
import { syncClientPendingCart } from "@/lib/server/admin-store";
import { findClientUserById } from "@/lib/server/client-users";

interface CartSyncBody {
  pendingItems?: number;
}

export async function POST(request: Request) {
  const session = await getClientSession();

  if (!session) {
    return NextResponse.json({ ok: true, synced: false });
  }

  const user = await findClientUserById(session.sub);
  if (!user) {
    return NextResponse.json({ ok: true, synced: false });
  }

  const body = (await request.json()) as CartSyncBody;
  const pendingItems = Math.max(0, Math.floor(Number(body.pendingItems ?? 0)));

  await syncClientPendingCart({
    email: user.email,
    pendingItems,
  });

  return NextResponse.json({ ok: true, synced: true });
}
