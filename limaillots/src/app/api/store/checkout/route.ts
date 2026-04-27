import { NextResponse } from "next/server";
import { processCheckout } from "@/lib/server/admin-store";
import { getClientSession } from "@/lib/server/client-auth";
import { findClientUserById } from "@/lib/server/client-users";

interface CheckoutBody {
  items?: Array<{ productId: string; quantity: number }>;
  wishlistIds?: string[];
  promoCode?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutBody;

  const session = await getClientSession();
  let clientEmail = "";

  if (session) {
    const user = await findClientUserById(session.sub);
    if (user) {
      clientEmail = user.email;
    }
  }

  const result = await processCheckout({
    items: Array.isArray(body.items) ? body.items : [],
    wishlistIds: Array.isArray(body.wishlistIds) ? body.wishlistIds : [],
    promoCode: body.promoCode,
    clientEmail,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
