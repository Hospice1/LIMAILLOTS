import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/server/client-auth";
import { getClientAccountByEmail } from "@/lib/server/admin-store";
import { findClientUserById } from "@/lib/server/client-users";

export async function GET() {
  const session = await getClientSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Non authentifie.",
      },
      { status: 401 },
    );
  }

  const user = await findClientUserById(session.sub);

  if (!user || user.deletedAt) {
    return NextResponse.json(
      {
        ok: false,
        message: "Compte supprime.",
      },
      { status: 401 },
    );
  }

  const account = await getClientAccountByEmail(user.email);

  if (!account.client) {
    return NextResponse.json(
      {
        ok: false,
        message: "Compte introuvable.",
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      city: user.city,
    },
    client: account.client,
    orders: account.orders,
  });
}
