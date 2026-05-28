import { NextResponse } from "next/server";
import { processCheckout } from "@/lib/server/admin-store";
import { getClientSession } from "@/lib/server/client-auth";
import { findClientUserById } from "@/lib/server/client-users";
import { CheckoutCustomer } from "@/types/store";

interface CheckoutBody {
  items?: Array<{ productId: string; quantity: number }>;
  wishlistIds?: string[];
  promoCode?: string;
  customer?: Partial<CheckoutCustomer>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutBody;

  const session = await getClientSession();
  let accountEmail = "";

  if (session) {
    const user = await findClientUserById(session.sub);
    if (user) {
      accountEmail = user.email;
    }
  }

  const result = await processCheckout({
    items: Array.isArray(body.items) ? body.items : [],
    wishlistIds: Array.isArray(body.wishlistIds) ? body.wishlistIds : [],
    promoCode: body.promoCode,
    clientEmail: body.customer?.email || accountEmail,
    customer: {
      email: body.customer?.email || accountEmail,
      phone: body.customer?.phone ?? "",
      wantsDelivery: Boolean(body.customer?.wantsDelivery),
      deliveryAddress: body.customer?.deliveryAddress ?? "",
    },
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}