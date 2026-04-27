import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/server/admin-store";

interface PromoRequestBody {
  code?: string;
  subtotal?: number;
}

export async function POST(request: Request) {
  const body = (await request.json()) as PromoRequestBody;

  const result = await validatePromoCode({
    code: body.code ?? "",
    subtotal: Number(body.subtotal ?? 0),
  });

  return NextResponse.json(result, { status: result.valid ? 200 : 400 });
}
