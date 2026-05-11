import { products as defaultProducts, promoCodes as basePromoCodes } from "@/data/store-data";
import {
  AdminClient,
  AdminPromoCode,
  AdminSalesPoint,
  AdminStateData,
} from "@/types/admin";

export const DEFAULT_ADMIN_PASSWORD = "LIMAILLOTS#2026";
export const DEFAULT_ADMIN_EMAIL = "admin@limaillots.shop";
export const STOREFRONT_CLIENT_ID = "cl-web-guest";

const defaultSales: AdminSalesPoint[] = [
  { period: "Jan", revenue: 312000, orders: 18 },
  { period: "Feb", revenue: 428000, orders: 25 },
  { period: "Mar", revenue: 507000, orders: 29 },
  { period: "Apr", revenue: 689000, orders: 36 },
  { period: "May", revenue: 742000, orders: 41 },
  { period: "Jun", revenue: 815000, orders: 46 },
];

const defaultClients: AdminClient[] = [
  {
    id: "cl-001",
    fullName: "Awa Koudjo",
    email: "awa.koudjo@mail.com",
    phone: "+229 97 11 22 33",
    city: "Cotonou",
    totalSpent: 189970,
    completedOrders: 6,
    pendingCarts: 1,
    favoriteProductIds: ["france-away-2425", "sprintedge-fg-elite", "sac-sport-35l"],
    promoCodesUsed: ["LIMAILL0T5", "CAMPUS15"],
    reviews: [
      {
        id: "rv-awa-1",
        productId: "france-away-2425",
        rating: 5,
        comment: "Tres bonne qualite, taille parfaite.",
        createdAt: "2026-04-02",
        status: "published",
      },
    ],
    notifications: [
      {
        id: "ntf-awa-1",
        title: "Code Promo Etudiant",
        message: "Code AWA10 actif cette semaine sur les maillots.",
        createdAt: "2026-04-20",
        read: false,
      },
    ],
    lastActivityAt: "2026-04-24",
  },
  {
    id: "cl-002",
    fullName: "Yann Ahonon",
    email: "yann.ahonon@mail.com",
    phone: "+229 96 45 10 10",
    city: "Porto-Novo",
    totalSpent: 124980,
    completedOrders: 4,
    pendingCarts: 2,
    favoriteProductIds: ["controlpulse-ag", "psg-home-2425"],
    promoCodesUsed: ["LIMAILL0T5"],
    reviews: [
      {
        id: "rv-yann-1",
        productId: "controlpulse-ag",
        rating: 4,
        comment: "Bon maintien, je recommande.",
        createdAt: "2026-04-10",
        status: "published",
      },
      {
        id: "rv-yann-2",
        productId: "psg-home-2425",
        rating: 5,
        comment: "Design propre et tissu agreable.",
        createdAt: "2026-04-12",
        status: "pending",
      },
    ],
    notifications: [],
    lastActivityAt: "2026-04-23",
  },
  {
    id: "cl-003",
    fullName: "Mireille Toko",
    email: "mireille.toko@mail.com",
    phone: "+229 99 88 77 66",
    city: "Parakou",
    totalSpent: 87980,
    completedOrders: 3,
    pendingCarts: 0,
    favoriteProductIds: ["sac-sport-35l", "chaussettes-grip-pack3"],
    promoCodesUsed: ["LIMAILL0T5"],
    reviews: [],
    notifications: [],
    lastActivityAt: "2026-04-20",
  },
  {
    id: "cl-004",
    fullName: "Koffi Dossou",
    email: "koffi.dossou@mail.com",
    phone: "+229 95 32 15 62",
    city: "Abomey",
    totalSpent: 219990,
    completedOrders: 7,
    pendingCarts: 1,
    favoriteProductIds: ["real-authentic-2425", "sprintedge-fg-elite"],
    promoCodesUsed: ["CAMPUS15", "LIMAILL0T5"],
    reviews: [
      {
        id: "rv-koffi-1",
        productId: "real-authentic-2425",
        rating: 5,
        comment: "Qualite premium validee.",
        createdAt: "2026-04-08",
        status: "published",
      },
    ],
    notifications: [],
    lastActivityAt: "2026-04-25",
  },
  {
    id: "cl-005",
    fullName: "Nadine Agbo",
    email: "nadine.agbo@mail.com",
    phone: "+229 90 66 19 30",
    city: "Calavi",
    totalSpent: 54990,
    completedOrders: 2,
    pendingCarts: 3,
    favoriteProductIds: ["pack-supporter-campus"],
    promoCodesUsed: [],
    reviews: [],
    notifications: [],
    lastActivityAt: "2026-04-19",
  },
];

function normalizeReviewStatus(status: unknown): "published" | "pending" | "removed" {
  return status === "published" || status === "removed" ? status : "pending";
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
          typeof candidate.productId === 'string' ? candidate.productId : fallbackItems[index]?.productId ?? '',
        quantity:
          typeof candidate.quantity === 'number' && Number.isFinite(candidate.quantity)
            ? Math.max(1, Math.floor(candidate.quantity))
            : fallbackItems[index]?.quantity ?? 1,
        unitPrice:
          typeof candidate.unitPrice === 'number' && Number.isFinite(candidate.unitPrice)
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
    usedCount: index === 0 ? 38 : 21,
    isActive: true,
    createdAt: "2026-04-01",
  }));
}

export function createDefaultAdminStateData(): AdminStateData {
  return {
    products: structuredClone(defaultProducts),
    clients: structuredClone(defaultClients),
    promoCodes: createDefaultPromoCodes(),
    sales: structuredClone(defaultSales),
    orders: [
      {
        id: "ord-2026-0412",
        clientId: "cl-001",
        total: 55980,
        status: "completed",
        promoCode: "LIMAILL0T5",
        items: [
          { productId: "france-away-2425", quantity: 1, unitPrice: 42990 },
          { productId: "chaussettes-compression-pack2", quantity: 1, unitPrice: 12990 },
        ],
        createdAt: "2026-04-12",
      },
      {
        id: "ord-2026-0418",
        clientId: "cl-004",
        total: 66980,
        status: "completed",
        promoCode: "CAMPUS15",
        items: [
          { productId: "real-authentic-2425", quantity: 1, unitPrice: 47990 },
          { productId: "protege-tibias-carbon", quantity: 1, unitPrice: 18990 },
        ],
        createdAt: "2026-04-18",
      },
      {
        id: "ord-2026-0424",
        clientId: "cl-002",
        total: 88970,
        status: "pending",
        items: [
          { productId: "controlpulse-ag", quantity: 1, unitPrice: 68990 },
          { productId: "gourde-thermique-750", quantity: 2, unitPrice: 9990 },
        ],
        createdAt: "2026-04-24",
      },
    ],
    changeHistory: [],
  };
}

export function normalizeAdminStateData(input: unknown): AdminStateData {
  const fallback = createDefaultAdminStateData();

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const parsed = input as Partial<AdminStateData>;

  const products = Array.isArray(parsed.products)
    ? parsed.products
    : fallback.products;

  const clientsRaw = Array.isArray(parsed.clients)
    ? parsed.clients
    : fallback.clients;

  const clients = clientsRaw.map((client, index) => ({
    ...client,
    notifications: Array.isArray(client.notifications)
      ? client.notifications
      : fallback.clients[index]?.notifications ?? [],
    reviews: normalizeClientReviews(client.reviews, fallback.clients[index]?.reviews ?? []),
  }));

  const promoCodes = Array.isArray(parsed.promoCodes)
    ? parsed.promoCodes
    : fallback.promoCodes;

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
          status: candidate.status === "pending" ? "pending" : "completed",
          promoCode:
            typeof candidate.promoCode === "string" && candidate.promoCode.trim()
              ? candidate.promoCode.trim()
              : fallbackOrder?.promoCode,
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
    sales,
    orders,
    changeHistory,
  };
}





