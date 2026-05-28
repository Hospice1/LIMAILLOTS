import { Prisma, PrismaClient } from "@prisma/client";
import { compare, hash, hashSync } from "bcryptjs";
import {
  createDefaultAdminStateData,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  normalizeAdminStateData,
} from "@/data/admin-defaults";
import {
  AdminClient,
  AdminDatabase,
  AdminPromoCode,
  AdminSettings,
  AdminStateData,
  PublicStoreState,
  ReviewStatus,
} from '@/types/admin';
import { CheckoutCustomer, Product } from "@/types/store";
import { getPrismaClient } from "@/lib/server/prisma";
import { deleteClientUserByEmail, findClientUserByEmail, reactivateClientUserByEmail } from "@/lib/server/client-users";

interface PersistedAdminUser {
  id: string;
  email: string;
  passwordHash: string;
  recoveryEmail: string;
  updatedAt: string;
}

interface PersistedState {
  state: AdminStateData;
  admin: PersistedAdminUser;
}

interface CheckoutInput {
  items: Array<{ productId: string; quantity: number }>;
  wishlistIds: string[];
  promoCode?: string;
  clientEmail?: string;
  customer?: Partial<CheckoutCustomer>;
}

interface CheckoutResult {
  ok: boolean;
  message: string;
  subtotal: number;
  discountAmount: number;
  finalPrice: number;
  appliedPromoCode: string;
  orderId?: string;
  products: Product[];
  promoCodes: AdminPromoCode[];
  clients: AdminClient[];
  orders: AdminStateData["orders"];
}

interface MemoryStore {
  state: AdminStateData;
  admin: PersistedAdminUser;
}

declare global {
  var limaillotsMemoryStore: MemoryStore | undefined;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function toJsonValue(value: AdminStateData): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function buildAdminSettings(admin: PersistedAdminUser): AdminSettings {
  return {
    adminEmail: admin.email,
    recoveryEmail: admin.recoveryEmail,
    updatedAt: admin.updatedAt,
  };
}

function buildAdminDatabase(state: AdminStateData, admin: PersistedAdminUser): AdminDatabase {
  return {
    ...cloneValue(state),
    settings: buildAdminSettings(admin),
  };
}

function formatSalesPeriod(date: Date): string {
  const label = new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date);
  const cleaned = label.replace(".", "").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function createClientFromEmail(
  email: string,
  dateLabel: string,
  profile?: { fullName?: string; phone?: string; city?: string; deliveryAddress?: string; wantsDelivery?: boolean },
): AdminClient {
  const name = profile?.fullName?.trim() || email.split("@")[0] || "Client";
  return {
    id: `cl-${Date.now().toString(36)}`,
    fullName: name.replace(/[._-]+/g, " ").trim() || "Client LIMAILLOTS",
    email,
    phone: profile?.phone?.trim() ?? "",
    city: profile?.city?.trim() ?? "",
    deliveryAddress: profile?.deliveryAddress?.trim() ?? "",
    wantsDelivery: Boolean(profile?.wantsDelivery),
    totalSpent: 0,
    completedOrders: 0,
    pendingCarts: 0,
    favoriteProductIds: [],
    promoCodesUsed: [],
    reviews: [],
    notifications: [],
    lastActivityAt: dateLabel,
  };
}

function createReviewId(): string {
  return `rv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeReviewPhotos(photos?: string[]): string[] {
  return Array.from(new Set((photos ?? []).map((photo) => photo.trim()).filter(Boolean))).slice(0, 4);
}

async function upsertClientReviewInState(input: {
  email: string;
  fullName: string;
  rating: number;
  comment: string;
  photos?: string[];
  productId?: string;
}): Promise<{ clientId: string; reviewId: string }> {
  const persisted = await readPersistedState();
  const nextState = cloneValue(persisted.state);
  const normalizedEmail = input.email.trim().toLowerCase();
  const dateLabel = new Date().toISOString().slice(0, 10);
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating ?? 5))));
  const comment = input.comment.trim();
  const productId = input.productId?.trim() || "site-review";
  const reviewId = createReviewId();
  const photos = normalizeReviewPhotos(input.photos);

  const clientIndex = nextState.clients.findIndex((item) => item.email.toLowerCase() === normalizedEmail);

  if (clientIndex >= 0) {
    const client = nextState.clients[clientIndex];
    nextState.clients[clientIndex] = {
      ...client,
      fullName: input.fullName.trim() || client.fullName,
      lastActivityAt: dateLabel,
      reviews: [
        {
          id: reviewId,
          productId,
          rating,
          comment,
            photos,
            createdAt: dateLabel,
            status: "pending",
        },
        ...client.reviews,
      ],
    };
  } else {
    const client = createClientFromEmail(normalizedEmail, dateLabel, {
      fullName: input.fullName,
    });

    nextState.clients.unshift({
      ...client,
      reviews: [
        {
          id: reviewId,
          productId,
          rating,
          comment,
          photos,
          createdAt: dateLabel,
          status: "pending",
        },
      ],
    });
  }

  await savePersistedState(nextState);

  const savedClient = nextState.clients.find((item) => item.email.toLowerCase() === normalizedEmail);
  return {
    clientId: savedClient?.id ?? `cl-${Date.now().toString(36)}`,
    reviewId,
  };
}

export async function addClientReview(input: {
  email: string;
  fullName: string;
  rating: number;
  comment: string;
  photos?: string[];
  productId?: string;
}): Promise<{ ok: boolean; message: string; reviewId?: string; clientId?: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, message: "Email requis." };
  }

  if (!input.comment.trim()) {
    return { ok: false, message: "Commentaire requis." };
  }

  const submitted = await upsertClientReviewInState(input);
  return {
    ok: true,
    message: "Merci pour votre avis. Il sera visible apres moderation.",
    reviewId: submitted.reviewId,
    clientId: submitted.clientId,
  };
}

export async function updateClientReviewStatus(input: {
  reviewId: string;
  status: ReviewStatus;
}): Promise<{ ok: boolean; message: string }> {
  const reviewId = input.reviewId.trim();
  if (!reviewId) {
    return { ok: false, message: "Avis introuvable." };
  }

  const persisted = await readPersistedState();
  const nextState = cloneValue(persisted.state);
  let found = false;

  nextState.clients = nextState.clients.map((client) => ({
    ...client,
    reviews: client.reviews.map((review) => {
      if (review.id !== reviewId) return review;
      found = true;
      return { ...review, status: input.status };
    }),
  }));

  if (!found) {
    return { ok: false, message: "Avis introuvable." };
  }

  await savePersistedState(nextState);
  return { ok: true, message: "Statut de l'avis mis a jour." };
}
async function ensureDatabaseSeeded(prisma: PrismaClient): Promise<void> {
  const [adminCount, stateCount] = await Promise.all([
    prisma.adminUser.count(),
    prisma.storeState.count(),
  ]);

  if (adminCount === 0) {
    await prisma.adminUser.create({
      data: {
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash: await hash(DEFAULT_ADMIN_PASSWORD, 12),
        recoveryEmail: "",
      },
    });
  }

  if (stateCount === 0) {
    await prisma.storeState.create({
      data: {
        id: 1,
        data: toJsonValue(createDefaultAdminStateData()),
      },
    });
  }
}

async function ensureMemoryStore(): Promise<MemoryStore> {
  if (globalThis.limaillotsMemoryStore) {
    return globalThis.limaillotsMemoryStore;
  }

  globalThis.limaillotsMemoryStore = {
    state: createDefaultAdminStateData(),
    admin: {
      id: "admin-main",
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: hashSync(DEFAULT_ADMIN_PASSWORD, 12),
      recoveryEmail: "",
      updatedAt: new Date().toISOString(),
    },
  };

  return globalThis.limaillotsMemoryStore;
}

async function readPersistedState(): Promise<PersistedState> {
  const prisma = getPrismaClient();

  if (!prisma) {
    const memory = await ensureMemoryStore();
    return {
      state: cloneValue(memory.state),
      admin: { ...memory.admin },
    };
  }

  await ensureDatabaseSeeded(prisma);

  const [admin, storeState] = await Promise.all([
    prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.storeState.findUnique({ where: { id: 1 } }),
  ]);

  if (!admin || !storeState) {
    await ensureDatabaseSeeded(prisma);

    const [seededAdmin, seededStoreState] = await Promise.all([
      prisma.adminUser.findFirstOrThrow({ orderBy: { createdAt: "asc" } }),
      prisma.storeState.findUniqueOrThrow({ where: { id: 1 } }),
    ]);

    return {
      state: normalizeAdminStateData(seededStoreState.data),
      admin: {
        id: seededAdmin.id,
        email: seededAdmin.email,
        passwordHash: seededAdmin.passwordHash,
        recoveryEmail: seededAdmin.recoveryEmail,
        updatedAt: seededAdmin.updatedAt.toISOString(),
      },
    };
  }

  return {
    state: normalizeAdminStateData(storeState.data),
    admin: {
      id: admin.id,
      email: admin.email,
      passwordHash: admin.passwordHash,
      recoveryEmail: admin.recoveryEmail,
      updatedAt: admin.updatedAt.toISOString(),
    },
  };
}

async function savePersistedState(nextState: AdminStateData): Promise<void> {
  const prisma = getPrismaClient();

  if (!prisma) {
    const memory = await ensureMemoryStore();
    memory.state = cloneValue(nextState);
    return;
  }

  await prisma.storeState.upsert({
    where: { id: 1 },
    update: {
      data: toJsonValue(nextState),
    },
    create: {
      id: 1,
      data: toJsonValue(nextState),
    },
  });
}

async function savePersistedAdmin(adminUpdate: {
  id: string;
  passwordHash?: string;
  recoveryEmail?: string;
}): Promise<PersistedAdminUser> {
  const prisma = getPrismaClient();

  if (!prisma) {
    const memory = await ensureMemoryStore();

    memory.admin = {
      ...memory.admin,
      passwordHash: adminUpdate.passwordHash ?? memory.admin.passwordHash,
      recoveryEmail: adminUpdate.recoveryEmail ?? memory.admin.recoveryEmail,
      updatedAt: new Date().toISOString(),
    };

    return { ...memory.admin };
  }

  const updated = await prisma.adminUser.update({
    where: { id: adminUpdate.id },
    data: {
      passwordHash: adminUpdate.passwordHash,
      recoveryEmail: adminUpdate.recoveryEmail,
    },
  });

  return {
    id: updated.id,
    email: updated.email,
    passwordHash: updated.passwordHash,
    recoveryEmail: updated.recoveryEmail,
    updatedAt: updated.updatedAt.toISOString(),
  };
}

function getPublicStateShape(state: AdminStateData): PublicStoreState {
  return {
    products: cloneValue(state.products),
    promoCodes: cloneValue(state.promoCodes),
    marquee: cloneValue(state.marquee),
    clients: cloneValue(state.clients),
    orders: cloneValue(state.orders),
  };
}

export async function isDatabaseBackedStore(): Promise<boolean> {
  return getPrismaClient() !== null;
}

export async function getPublicStoreState(): Promise<PublicStoreState> {
  const persisted = await readPersistedState();
  return getPublicStateShape(persisted.state);
}

export async function getAdminDatabase(): Promise<AdminDatabase> {
  const persisted = await readPersistedState();
  return buildAdminDatabase(persisted.state, persisted.admin);
}

export async function replaceAdminState(nextStateInput: unknown): Promise<AdminDatabase> {
  const persisted = await readPersistedState();
  const normalized = normalizeAdminStateData(nextStateInput);

  await savePersistedState(normalized);

  return buildAdminDatabase(normalized, persisted.admin);
}

export async function authenticateAdminPassword(password: string): Promise<{
  valid: boolean;
  adminUserId?: string;
}> {
  const persisted = await readPersistedState();
  const isValid = await compare(password, persisted.admin.passwordHash);

  if (!isValid) {
    return { valid: false };
  }

  return {
    valid: true,
    adminUserId: persisted.admin.id,
  };
}

export async function updateAdminSecurity(input: {
  currentPassword: string;
  newPassword: string;
  recoveryEmail: string;
}): Promise<{ ok: boolean; message: string; settings?: AdminSettings }> {
  const persisted = await readPersistedState();

  const currentPasswordValid = await compare(input.currentPassword, persisted.admin.passwordHash);

  if (!currentPasswordValid) {
    return { ok: false, message: "Mot de passe actuel incorrect." };
  }

  if (input.newPassword.length < 8) {
    return { ok: false, message: "Le nouveau mot de passe doit contenir au moins 8 caracteres." };
  }

  const updatedAdmin = await savePersistedAdmin({
    id: persisted.admin.id,
    passwordHash: await hash(input.newPassword, 12),
    recoveryEmail: input.recoveryEmail.trim(),
  });

  return {
    ok: true,
    message: "Securite admin mise a jour.",
    settings: buildAdminSettings(updatedAdmin),
  };
}

export async function ensureClientProfile(input: {
  email: string;
  fullName?: string;
  phone?: string;
  city?: string;
}): Promise<AdminClient> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const dateLabel = new Date().toISOString().slice(0, 10);

  const persisted = await readPersistedState();
  const nextState = cloneValue(persisted.state);

  const existingIndex = nextState.clients.findIndex(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (existingIndex >= 0) {
    const existing = nextState.clients[existingIndex];

    if (existing.deletedAt) {
      return cloneValue(existing);
    }

    nextState.clients[existingIndex] = {
      ...existing,
      fullName: input.fullName?.trim() || existing.fullName,
      phone: input.phone?.trim() || existing.phone,
      city: input.city?.trim() || existing.city,
      lastActivityAt: dateLabel,
    };

    await savePersistedState(nextState);
    return cloneValue(nextState.clients[existingIndex]);
  }

  const createdClient = createClientFromEmail(normalizedEmail, dateLabel, {
    fullName: input.fullName,
    phone: input.phone,
    city: input.city,
  });

  nextState.clients.unshift(createdClient);
  await savePersistedState(nextState);

  return cloneValue(createdClient);
}

export async function deleteAdminClientByEmail(input: {
  email: string;
  reason?: string;
}): Promise<{ ok: boolean; message: string; client?: AdminClient }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, message: "Email requis." };
  }

  const persisted = await readPersistedState();
  const nextState = cloneValue(persisted.state);
  const clientIndex = nextState.clients.findIndex(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (clientIndex < 0) {
    return { ok: false, message: "Client introuvable." };
  }

  const currentClient = nextState.clients[clientIndex];
  if (currentClient.deletedAt) {
    return { ok: false, message: "Ce compte est deja supprime." };
  }

  const updatedClient = {
    ...currentClient,
    deletedAt: new Date().toISOString(),
    deletedReason: input.reason?.trim() || "Compte supprime par l'administrateur.",
  };

  nextState.clients[clientIndex] = updatedClient;
  await savePersistedState(nextState);

  const authUser = await findClientUserByEmail(normalizedEmail);
  if (authUser && !authUser.deletedAt) {
    await deleteClientUserByEmail({ email: normalizedEmail, reason: updatedClient.deletedReason });
  }

  return { ok: true, message: "Compte client supprime.", client: cloneValue(updatedClient) };
}

export async function reactivateAdminClientByEmail(input: {
  email: string;
}): Promise<{ ok: boolean; message: string; client?: AdminClient }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, message: "Email requis." };
  }

  const persisted = await readPersistedState();
  const nextState = cloneValue(persisted.state);
  const clientIndex = nextState.clients.findIndex(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (clientIndex < 0) {
    return { ok: false, message: "Client introuvable." };
  }

  const currentClient = nextState.clients[clientIndex];
  if (!currentClient.deletedAt) {
    return { ok: false, message: "Ce compte est deja actif." };
  }

  const deletedAt = new Date(currentClient.deletedAt);
  if (Number.isNaN(deletedAt.getTime())) {
    return { ok: false, message: "Date de suppression invalide." };
  }

  const diffDays = (Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 30) {
    return { ok: false, message: "Reactivation impossible apres 30 jours." };
  }

  const updatedClient = {
    ...currentClient,
    deletedAt: undefined,
    deletedReason: undefined,
    lastActivityAt: new Date().toISOString().slice(0, 10),
  };

  nextState.clients[clientIndex] = updatedClient;
  await savePersistedState(nextState);

  const authUser = await findClientUserByEmail(normalizedEmail);
  if (authUser?.deletedAt) {
    const authResult = await reactivateClientUserByEmail({ email: normalizedEmail });
    if (!authResult.ok) {
      return { ok: false, message: authResult.message };
    }
  }

  return { ok: true, message: "Compte client reactive.", client: cloneValue(updatedClient) };
}

export async function getClientAccountByEmail(email: string): Promise<{
  client: AdminClient | null;
  orders: AdminStateData["orders"];
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const persisted = await readPersistedState();

  const client =
    persisted.state.clients.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    ) ?? null;

  if (!client || client.deletedAt) {
    return {
      client: null,
      orders: [],
    };
  }

  return {
    client: cloneValue(client),
    orders: persisted.state.orders.filter((order) => order.clientId === client.id),
  };
}

export async function syncClientPendingCart(input: {
  email: string;
  pendingItems: number;
}): Promise<void> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const pendingItems = Math.max(0, Math.floor(Number(input.pendingItems ?? 0)));
  const dateLabel = new Date().toISOString().slice(0, 10);

  const persisted = await readPersistedState();
  const nextState = cloneValue(persisted.state);

  const existingIndex = nextState.clients.findIndex(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (existingIndex >= 0) {
    if (nextState.clients[existingIndex].deletedAt) {
      return;
    }

    nextState.clients[existingIndex] = {
      ...nextState.clients[existingIndex],
      pendingCarts: pendingItems > 0 ? 1 : 0,
      lastActivityAt: dateLabel,
    };

    await savePersistedState(nextState);
    return;
  }

  if (pendingItems <= 0) {
    return;
  }

  const createdClient = createClientFromEmail(normalizedEmail, dateLabel);
  createdClient.pendingCarts = 1;
  nextState.clients.unshift(createdClient);
  await savePersistedState(nextState);
}

export async function validatePromoCode(input: {
  code: string;
  subtotal: number;
}): Promise<{
  valid: boolean;
  code: string;
  discountPercent: number;
  message: string;
}> {
  const persisted = await readPersistedState();
  const normalizedCode = input.code.trim().toUpperCase();
  const subtotal = Number(input.subtotal ?? 0);

  const promo = persisted.state.promoCodes.find((item) => item.code === normalizedCode);

  if (!promo) {
    return { valid: false, code: normalizedCode, discountPercent: 0, message: "Code promo invalide." };
  }

  if (!promo.isActive) {
    return { valid: false, code: normalizedCode, discountPercent: 0, message: "Ce code promo est desactive." };
  }

  if (promo.usedCount >= promo.usageLimit) {
    return {
      valid: false,
      code: normalizedCode,
      discountPercent: 0,
      message: "Ce code promo a atteint sa limite d'utilisation.",
    };
  }

  if (subtotal < promo.minSubtotal) {
    return {
      valid: false,
      code: normalizedCode,
      discountPercent: 0,
      message: `Ce code est disponible a partir de ${promo.minSubtotal.toLocaleString("fr-FR")} XOF.`,
    };
  }

  return {
    valid: true,
    code: promo.code,
    discountPercent: promo.discountPercent,
    message: `Reduction de ${promo.discountPercent}% appliquee.`,
  };
}

export async function processCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const persisted = await readPersistedState();
  const currentState = cloneValue(persisted.state);

  const normalizedItems = input.items
    .map((item) => ({
      productId: String(item.productId),
      quantity: Math.max(0, Math.floor(Number(item.quantity ?? 0))),
    }))
    .filter((item) => item.productId.length > 0 && item.quantity > 0);

  if (normalizedItems.length === 0) {
    return {
      ok: false,
      message: "Le panier est vide.",
      subtotal: 0,
      discountAmount: 0,
      finalPrice: 0,
      appliedPromoCode: "",
      ...getPublicStateShape(currentState),
    };
  }

  const quantityByProduct = new Map<string, number>();
  for (const item of normalizedItems) {
    quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  const productsById = new Map(currentState.products.map((product) => [product.id, product]));

  let subtotal = 0;
  for (const [productId, quantity] of quantityByProduct.entries()) {
    const product = productsById.get(productId);

    if (!product) {
      return {
        ok: false,
        message: "Un produit du panier n'existe plus.",
        subtotal: 0,
        discountAmount: 0,
        finalPrice: 0,
        appliedPromoCode: "",
        ...getPublicStateShape(currentState),
      };
    }

    if (quantity > product.stock) {
      return {
        ok: false,
        message: `Stock insuffisant pour ${product.name}.`,
        subtotal: 0,
        discountAmount: 0,
        finalPrice: 0,
        appliedPromoCode: "",
        ...getPublicStateShape(currentState),
      };
    }

    subtotal += product.price * quantity;
  }

  const promoCandidate = input.promoCode?.trim().toUpperCase() ?? "";
  let appliedPromoCode = "";
  let discountPercent = 0;

  if (promoCandidate) {
    const promoValidation = await validatePromoCode({ code: promoCandidate, subtotal });

    if (!promoValidation.valid) {
      return {
        ok: false,
        message: promoValidation.message,
        subtotal,
        discountAmount: 0,
        finalPrice: subtotal,
        appliedPromoCode: "",
        ...getPublicStateShape(currentState),
      };
    }

    appliedPromoCode = promoValidation.code;
    discountPercent = promoValidation.discountPercent;
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalPrice = Math.max(subtotal - discountAmount, 0);

  currentState.products = currentState.products.map((product) => {
    const soldQuantity = quantityByProduct.get(product.id);
    if (!soldQuantity) return product;

    return {
      ...product,
      stock: Math.max(product.stock - soldQuantity, 0),
      popularity: product.popularity + soldQuantity,
    };
  });

  const date = new Date();
  const dateLabel = date.toISOString().slice(0, 10);
  const normalizedEmail = (input.customer?.email || input.clientEmail || "").trim().toLowerCase();
  const customerPhone = input.customer?.phone?.trim() ?? "";
  const wantsDelivery = Boolean(input.customer?.wantsDelivery);
  const deliveryAddress = input.customer?.deliveryAddress?.trim() ?? "";

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return {
      ok: false,
      message: "Email client requis pour finaliser la commande.",
      subtotal: 0,
      discountAmount: 0,
      finalPrice: 0,
      appliedPromoCode: "",
      ...getPublicStateShape(currentState),
    };
  }

  if (!customerPhone) {
    return {
      ok: false,
      message: "Numero de telephone requis pour finaliser la commande.",
      subtotal: 0,
      discountAmount: 0,
      finalPrice: 0,
      appliedPromoCode: "",
      ...getPublicStateShape(currentState),
    };
  }

  if (wantsDelivery && !deliveryAddress) {
    return {
      ok: false,
      message: "Adresse de livraison requise.",
      subtotal: 0,
      discountAmount: 0,
      finalPrice: 0,
      appliedPromoCode: "",
      ...getPublicStateShape(currentState),
    };
  }

  const authRecord = await findClientUserByEmail(normalizedEmail);
  if (authRecord?.deletedAt) {
    return {
      ok: false,
      message: "Ce compte a ete supprime et ne peut plus acheter.",
      subtotal: 0,
      discountAmount: 0,
      finalPrice: 0,
      appliedPromoCode: "",
      ...getPublicStateShape(currentState),
    };
  }

  let client: AdminClient;
  const existingIndex = currentState.clients.findIndex(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (existingIndex >= 0) {
    client = currentState.clients[existingIndex];

    if (client.deletedAt) {
      return {
        ok: false,
        message: "Ce compte a ete supprime et ne peut plus acheter.",
        subtotal: 0,
        discountAmount: 0,
        finalPrice: 0,
        appliedPromoCode: "",
        ...getPublicStateShape(currentState),
      };
    }
  } else {
    client = createClientFromEmail(normalizedEmail, dateLabel, {
      phone: customerPhone,
      city: deliveryAddress,
      deliveryAddress,
      wantsDelivery,
    });
    currentState.clients.unshift(client);
  }
  client.phone = customerPhone || client.phone;
  client.city = deliveryAddress || client.city;
  client.deliveryAddress = deliveryAddress || client.deliveryAddress;
  client.wantsDelivery = wantsDelivery;
  client.totalSpent += finalPrice;
  client.completedOrders += 1;
  client.pendingCarts = 0;
  client.lastActivityAt = dateLabel;
  client.favoriteProductIds = Array.from(new Set([...client.favoriteProductIds, ...(input.wishlistIds ?? [])]));

  if (appliedPromoCode) {
    client.promoCodesUsed = Array.from(new Set([...client.promoCodesUsed, appliedPromoCode]));
  }

  const orderId = `ord-${Date.now().toString(36)}`;

  currentState.orders.unshift({
    id: orderId,
    clientId: client.id,
    total: finalPrice,
    status: "new",
    promoCode: appliedPromoCode || undefined,
    customerEmail: normalizedEmail,
    customerPhone,
    deliveryAddress,
    wantsDelivery,
    items: Array.from(quantityByProduct.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
      unitPrice: productsById.get(productId)?.price ?? 0,
    })),
    createdAt: dateLabel,
  });

  const period = formatSalesPeriod(date);
  const salesIndex = currentState.sales.findIndex((point) => point.period === period);

  if (salesIndex >= 0) {
    currentState.sales[salesIndex] = {
      ...currentState.sales[salesIndex],
      revenue: currentState.sales[salesIndex].revenue + finalPrice,
      orders: currentState.sales[salesIndex].orders + 1,
    };
  } else {
    currentState.sales.push({ period, revenue: finalPrice, orders: 1 });
  }

  if (appliedPromoCode) {
    currentState.promoCodes = currentState.promoCodes.map((promo) => {
      if (promo.code !== appliedPromoCode) return promo;
      return { ...promo, usedCount: Math.min(promo.usedCount + 1, promo.usageLimit) };
    });
  }

  await savePersistedState(currentState);

  return {
    ok: true,
    message: "Commande validee. Merci pour votre confiance.",
    subtotal,
    discountAmount,
    finalPrice,
    appliedPromoCode,
    orderId,
    ...getPublicStateShape(currentState),
  };
}
