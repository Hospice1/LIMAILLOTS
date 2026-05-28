import { products as defaultProducts, promoCodes as basePromoCodes } from "@/data/store-data";
import { Product } from "@/types/store";
import {
  AdminClient,
  AdminMarqueeSettings,
  AdminPromoCode,
  AdminSalesPoint,
  AdminStateData,
} from "@/types/admin";

export const DEFAULT_ADMIN_PASSWORD = "LIMAILLOTS#2026";
export const DEFAULT_ADMIN_EMAIL = "admin@limaillots.shop";
export const STOREFRONT_CLIENT_ID = "cl-web-guest";

const defaultSales: AdminSalesPoint[] = [];

const defaultClients: AdminClient[] = [];

function createDefaultMarqueeSettings(promoCodes: AdminPromoCode[]): AdminMarqueeSettings {
  const featuredPromo = promoCodes[0]?.code ?? "LIMAILL0T5";
  return {
    promoCode: featuredPromo,
    message: `10% OFF POUR TOUTES COMMANDES AVEC LE CODE PROMO \"${featuredPromo}\"`,
  };
}

function normalizeReviewStatus(status: unknown): "published" | "pending" | "removed" {
  return status === "published" || status === "removed" ? status : "pending";
}
function normalizeProductRating(value: unknown, fallback = 4.5): number {
  const rating = Number(value);
  const safeFallback = Number.isFinite(fallback) ? fallback : 4.5;
  const resolved = Number.isFinite(rating) ? rating : safeFallback;
  return Math.round(Math.min(5, Math.max(0, resolved)) * 10) / 10;
}

function normalizeProducts(input: unknown, fallbackProducts: Product[]): Product[] {
  const source = Array.isArray(input) ? input : fallbackProducts;

  return source.map((item, index) => {
    const fallbackProduct = fallbackProducts[index];
    const candidate = item as Partial<Product>;

    return {
      ...(fallbackProduct ?? {}),
      ...candidate,
      rating: normalizeProductRating(candidate.rating, fallbackProduct?.rating ?? 4.5),
    } as Product;
  });
}

function normalizeClientReviews(
  clientReviews: unknown,
  fallbackReviews: AdminClient["reviews"],
): AdminClient["reviews"] {
  if (!Array.isArray(clientReviews)) {
    return structuredClone(fallbackReviews);
  }

  return clientReviews.map((review, index) => {
    const fallbackReview = fallbackReviews[index];
    const candidate = review as Partial<AdminClient["reviews"][number]>;

    return {
      id: typeof candidate.id === "string" ? candidate.id : fallbackReview?.id ?? `rv-${index + 1}`,
      productId:
        typeof candidate.productId === "string"
          ? candidate.productId
          : fallbackReview?.productId ?? "site-review",
      rating:
        typeof candidate.rating === "number" && Number.isFinite(candidate.rating)
          ? Math.min(5, Math.max(1, candidate.rating))
          : fallbackReview?.rating ?? 5,
      comment:
        typeof candidate.comment === "string"
          ? candidate.comment
          : fallbackReview?.comment ?? "",
      photos: Array.isArray(candidate.photos)
        ? candidate.photos.filter((photo): photo is string => typeof photo === "string").slice(0, 4)
        : fallbackReview?.photos ?? [],
      createdAt:
        typeof candidate.createdAt === "string"
          ? candidate.createdAt
          : fallbackReview?.createdAt ?? new Date().toISOString().slice(0, 10),
      status: normalizeReviewStatus(candidate.status ?? fallbackReview?.status),
    };
  });
}


function normalizeOrderStatus(status: unknown): AdminStateData["orders"][number]["status"] {
  if (
    status === "new" ||
    status === "confirmed" ||
    status === "delivered" ||
    status === "cancelled" ||
    status === "pending" ||
    status === "completed"
  ) {
    return status;
  }

  return "new";
}
function normalizeOrderItems(
  orderItems: unknown,
  fallbackItems: AdminStateData["orders"][number]["items"],
): AdminStateData["orders"][number]["items"] {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return structuredClone(fallbackItems);
  }

  return orderItems
    .map((item, index) => {
      const candidate = item as Partial<{ productId: string; quantity: number; unitPrice: number }>;
      return {
        productId:
          typeof candidate.productId === "string" ? candidate.productId : fallbackItems[index]?.productId ?? "",
        quantity:
          typeof candidate.quantity === "number" && Number.isFinite(candidate.quantity)
            ? Math.max(1, Math.floor(candidate.quantity))
            : fallbackItems[index]?.quantity ?? 1,
        unitPrice:
          typeof candidate.unitPrice === "number" && Number.isFinite(candidate.unitPrice)
            ? Math.max(0, Math.floor(candidate.unitPrice))
            : fallbackItems[index]?.unitPrice ?? 0,
      };
    })
    .filter((item) => item.productId.length > 0);
}

export function createDefaultPromoCodes(): AdminPromoCode[] {
  return basePromoCodes.map((promo, index) => ({
    id: `promo-${index + 1}`,
    code: promo.code,
    discountPercent: promo.discountPercent,
    minSubtotal: promo.minSubtotal,
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
    createdAt: "2026-04-01",
  }));
}

export function createDefaultAdminStateData(): AdminStateData {
  const promoCodes = createDefaultPromoCodes();

  return {
    products: structuredClone(defaultProducts),
    clients: structuredClone(defaultClients),
    promoCodes,
    marquee: createDefaultMarqueeSettings(promoCodes),
    sales: structuredClone(defaultSales),
    orders: [],
    changeHistory: [],
  };
}

function normalizeMarqueeSettings(input: unknown, fallback: AdminMarqueeSettings): AdminMarqueeSettings {
  if (!input || typeof input !== "object") {
    return fallback;
  }

  const candidate = input as Partial<AdminMarqueeSettings>;
  return {
    promoCode: typeof candidate.promoCode === "string" ? candidate.promoCode : fallback.promoCode,
    message: typeof candidate.message === "string" && candidate.message.trim().length > 0
      ? candidate.message
      : fallback.message,
  };
}

export function normalizeAdminStateData(input: unknown): AdminStateData {
  const fallback = createDefaultAdminStateData();

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const parsed = input as Partial<AdminStateData>;

  const products = normalizeProducts(parsed.products, fallback.products);

  const clientsRaw = Array.isArray(parsed.clients)
    ? parsed.clients
    : fallback.clients;

  const clients = clientsRaw.map((client, index) => ({
    ...client,
    notifications: Array.isArray(client.notifications)
      ? client.notifications
      : fallback.clients[index]?.notifications ?? [],
    deliveryAddress: typeof client.deliveryAddress === "string" ? client.deliveryAddress : fallback.clients[index]?.deliveryAddress ?? "",
    wantsDelivery: typeof client.wantsDelivery === "boolean" ? client.wantsDelivery : fallback.clients[index]?.wantsDelivery ?? false,
    reviews: normalizeClientReviews(client.reviews, fallback.clients[index]?.reviews ?? []),
  }));

  const promoCodes = Array.isArray(parsed.promoCodes)
    ? parsed.promoCodes
    : fallback.promoCodes;

  const marquee = normalizeMarqueeSettings(parsed.marquee, fallback.marquee);

  const sales = Array.isArray(parsed.sales)
    ? parsed.sales
    : fallback.sales;

  const orders = Array.isArray(parsed.orders)
    ? parsed.orders.map((order, index) => {
        const fallbackOrder = fallback.orders[index];
        const candidate = order as Partial<AdminStateData["orders"][number]>;

        return {
          id: typeof candidate.id === "string" ? candidate.id : fallbackOrder?.id ?? `ord-${index + 1}`,
          clientId:
            typeof candidate.clientId === "string" ? candidate.clientId : fallbackOrder?.clientId ?? "",
          total:
            typeof candidate.total === "number" && Number.isFinite(candidate.total)
              ? Math.max(0, Math.floor(candidate.total))
              : fallbackOrder?.total ?? 0,
          status: normalizeOrderStatus(candidate.status ?? fallbackOrder?.status),
          promoCode:
            typeof candidate.promoCode === "string" && candidate.promoCode.trim()
              ? candidate.promoCode.trim()
              : fallbackOrder?.promoCode,
          customerEmail:
            typeof candidate.customerEmail === "string" ? candidate.customerEmail : fallbackOrder?.customerEmail,
          customerPhone:
            typeof candidate.customerPhone === "string" ? candidate.customerPhone : fallbackOrder?.customerPhone,
          deliveryAddress:
            typeof candidate.deliveryAddress === "string" ? candidate.deliveryAddress : fallbackOrder?.deliveryAddress,
          wantsDelivery:
            typeof candidate.wantsDelivery === "boolean" ? candidate.wantsDelivery : fallbackOrder?.wantsDelivery,
          items: normalizeOrderItems(candidate.items, fallbackOrder?.items ?? []),
          createdAt:
            typeof candidate.createdAt === "string"
              ? candidate.createdAt
              : fallbackOrder?.createdAt ?? new Date().toISOString().slice(0, 10),
        } as AdminStateData["orders"][number];
      })
    : fallback.orders;

  const changeHistory = Array.isArray(parsed.changeHistory)
    ? parsed.changeHistory.map((item, index) => {
        const candidate = item as Partial<{ id: string; message: string; createdAt: string }>;
        return {
          id: typeof candidate.id === "string" ? candidate.id : `chg-${index + 1}`,
          message: typeof candidate.message === "string" ? candidate.message : "Modification enregistree.",
          createdAt:
            typeof candidate.createdAt === "string"
              ? candidate.createdAt
              : new Date().toISOString().slice(0, 10),
        } as AdminStateData["changeHistory"][number];
      })
    : fallback.changeHistory;

  return {
    products,
    clients,
    promoCodes,
    marquee,
    sales,
    orders,
    changeHistory,
  };
}
