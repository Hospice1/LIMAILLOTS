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

export function requireSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return { ok: true as const };
  }

  try {
    const requestOrigin = new URL(request.url).origin;
    const originHost = new URL(origin).origin;

    if (requestOrigin !== originHost) {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            ok: false,
            message: "Origine de requete invalide.",
          },
          { status: 403 },
        ),
      };
    }
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          ok: false,
          message: "Origine de requete invalide.",
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const };
}
