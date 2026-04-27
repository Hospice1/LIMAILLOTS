import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/admin-auth";

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          message: "Non autorise.",
        },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true as const,
    adminUserId: session.sub,
  };
}
