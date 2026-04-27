import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/server/client-auth";
import { findClientUserById } from "@/lib/server/client-users";

export async function GET() {
  const session = await getClientSession();

  if (!session) {
    return NextResponse.json({
      authenticated: false,
    });
  }

  const user = await findClientUserById(session.sub);

  if (!user) {
    return NextResponse.json({
      authenticated: false,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      city: user.city,
    },
  });
}
