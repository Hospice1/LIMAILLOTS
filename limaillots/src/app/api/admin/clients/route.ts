import { NextResponse } from "next/server";
import { requireAdminSession, requireSameOriginRequest } from "@/lib/server/admin-guard";
import { deleteAdminClientByEmail, reactivateAdminClientByEmail } from "@/lib/server/admin-store";

interface AdminClientActionBody {
  action?: "delete" | "reactivate";
  email?: string;
  reason?: string;
}

export async function POST(request: Request) {
  const originCheck = requireSameOriginRequest(request);
  if (!originCheck.ok) {
    return originCheck.response;
  }
  const session = await requireAdminSession();
  if (!session.ok) {
    return session.response;
  }

  const body = (await request.json()) as AdminClientActionBody;
  const action = body.action;
  const email = body.email?.trim() ?? "";

  if (!action || !email) {
    return NextResponse.json(
      {
        ok: false,
        message: "Action et email requis.",
      },
      { status: 400 },
    );
  }

  if (action === "delete") {
    const result = await deleteAdminClientByEmail({
      email,
      reason: body.reason,
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "reactivate") {
    const result = await reactivateAdminClientByEmail({ email });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return NextResponse.json(
    {
      ok: false,
      message: "Action inconnue.",
    },
    { status: 400 },
  );
}
