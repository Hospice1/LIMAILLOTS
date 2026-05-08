import { compare, hash } from "bcryptjs";
import { getPrismaClient } from "@/lib/server/prisma";

const REACTIVATION_WINDOW_DAYS = 30;

export interface ClientUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  city: string;
  deletedAt?: string;
  deletedReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoryClientStore {
  users: ClientUserRecord[];
}

declare global {
  var limaillotsMemoryClientUsers: MemoryClientStore | undefined;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toIso(value?: Date | string | null): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.toISOString();
}

function toRecord(input: {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  city: string;
  deletedAt?: Date | string | null;
  deletedReason?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): ClientUserRecord {
  return {
    id: input.id,
    email: normalizeEmail(input.email),
    passwordHash: input.passwordHash,
    fullName: input.fullName,
    phone: input.phone,
    city: input.city,
    deletedAt: toIso(input.deletedAt),
    deletedReason: input.deletedReason ?? undefined,
    createdAt: toIso(input.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(input.updatedAt) ?? new Date().toISOString(),
  };
}

function isDeleted(user: ClientUserRecord | null | undefined): boolean {
  return Boolean(user?.deletedAt);
}

function canReactivate(user: ClientUserRecord | null | undefined): boolean {
  if (!user?.deletedAt) return false;
  const deletedAt = new Date(user.deletedAt);
  if (Number.isNaN(deletedAt.getTime())) return false;
  const diffDays = (Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= REACTIVATION_WINDOW_DAYS;
}

async function ensureMemoryStore(): Promise<MemoryClientStore> {
  if (globalThis.limaillotsMemoryClientUsers) {
    return globalThis.limaillotsMemoryClientUsers;
  }

  globalThis.limaillotsMemoryClientUsers = { users: [] };
  return globalThis.limaillotsMemoryClientUsers;
}

async function findFromMemoryByEmail(email: string): Promise<ClientUserRecord | null> {
  const memory = await ensureMemoryStore();
  const user = memory.users.find((item) => item.email === email);
  return user ? cloneValue(user) : null;
}

async function findFromMemoryById(id: string): Promise<ClientUserRecord | null> {
  const memory = await ensureMemoryStore();
  const user = memory.users.find((item) => item.id === id);
  return user ? cloneValue(user) : null;
}

async function saveMemoryUser(nextUser: ClientUserRecord): Promise<ClientUserRecord> {
  const memory = await ensureMemoryStore();
  const index = memory.users.findIndex((item) => item.id === nextUser.id);
  if (index >= 0) {
    memory.users[index] = cloneValue(nextUser);
  } else {
    memory.users.unshift(cloneValue(nextUser));
  }
  return cloneValue(nextUser);
}

export async function findClientUserByEmail(email: string): Promise<ClientUserRecord | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const prisma = getPrismaClient();
  if (!prisma) {
    return findFromMemoryByEmail(normalizedEmail);
  }

  try {
    const user = await prisma.clientUser.findUnique({ where: { email: normalizedEmail } });
    return user ? toRecord(user) : null;
  } catch {
    return findFromMemoryByEmail(normalizedEmail);
  }
}

export async function findClientUserById(id: string): Promise<ClientUserRecord | null> {
  const normalizedId = id.trim();
  if (!normalizedId) return null;

  const prisma = getPrismaClient();
  if (!prisma) {
    return findFromMemoryById(normalizedId);
  }

  try {
    const user = await prisma.clientUser.findUnique({ where: { id: normalizedId } });
    return user ? toRecord(user) : null;
  } catch {
    return findFromMemoryById(normalizedId);
  }
}

async function persistClientUserRecord(user: ClientUserRecord): Promise<ClientUserRecord> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return saveMemoryUser(user);
  }

  const persisted = await prisma.clientUser.update({
    where: { id: user.id },
    data: {
      fullName: user.fullName,
      phone: user.phone,
      city: user.city,
      deletedAt: user.deletedAt ? new Date(user.deletedAt) : null,
      deletedReason: user.deletedReason ?? null,
    },
  });

  return toRecord(persisted);
}

export async function deleteClientUserByEmail(input: {
  email: string;
  reason?: string;
}): Promise<{ ok: boolean; message: string; user?: ClientUserRecord }> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, message: "Email requis." };
  }

  const existing = await findClientUserByEmail(email);
  if (!existing) {
    return { ok: false, message: "Compte introuvable." };
  }

  if (isDeleted(existing)) {
    return { ok: false, message: "Ce compte est deja supprime." };
  }

  const updated = await persistClientUserRecord({
    ...existing,
    deletedAt: new Date().toISOString(),
    deletedReason: input.reason?.trim() || "Supprime par l'administrateur.",
  });

  return {
    ok: true,
    message: "Compte client supprime et email bloque.",
    user: updated,
  };
}

export async function reactivateClientUserByEmail(input: {
  email: string;
}): Promise<{ ok: boolean; message: string; user?: ClientUserRecord }> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, message: "Email requis." };
  }

  const existing = await findClientUserByEmail(email);
  if (!existing) {
    return { ok: false, message: "Compte introuvable." };
  }

  if (!isDeleted(existing)) {
    return { ok: false, message: "Ce compte est deja actif." };
  }

  if (!canReactivate(existing)) {
    return { ok: false, message: "Reactivation impossible apres 30 jours." };
  }

  const updated = await persistClientUserRecord({
    ...existing,
    deletedAt: undefined,
    deletedReason: undefined,
  });

  return {
    ok: true,
    message: "Compte client reactive.",
    user: updated,
  };
}

export async function registerClientUser(input: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
}): Promise<{ ok: boolean; message: string; user?: ClientUserRecord }> {
  const email = normalizeEmail(input.email);
  const password = input.password;
  const fullName = input.fullName.trim() || "Client LIMAILLOTS";
  const phone = input.phone.trim();
  const city = input.city.trim();

  if (!email) {
    return { ok: false, message: "Email requis." };
  }

  if (password.length < 6) {
    return { ok: false, message: "Le mot de passe doit contenir au moins 6 caracteres." };
  }

  const existing = await findClientUserByEmail(email);
  if (existing) {
    return {
      ok: false,
      message: isDeleted(existing)
        ? "Cet email est definitivement banni."
        : "Un compte existe deja avec cet email.",
    };
  }

  const passwordHash = await hash(password, 12);
  const prisma = getPrismaClient();

  if (!prisma) {
    const now = new Date().toISOString();

    const user: ClientUserRecord = {
      id: `clu-${Date.now().toString(36)}`,
      email,
      passwordHash,
      fullName,
      phone,
      city,
      createdAt: now,
      updatedAt: now,
    };

    const memory = await ensureMemoryStore();
    memory.users.unshift(user);

    return { ok: true, message: "Compte cree avec succes.", user: cloneValue(user) };
  }

  try {
    const created = await prisma.clientUser.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        city,
      },
    });

    return {
      ok: true,
      message: "Compte cree avec succes.",
      user: toRecord(created),
    };
  } catch {
    const now = new Date().toISOString();
    const user: ClientUserRecord = {
      id: `clu-${Date.now().toString(36)}`,
      email,
      passwordHash,
      fullName,
      phone,
      city,
      createdAt: now,
      updatedAt: now,
    };

    const memory = await ensureMemoryStore();
    memory.users.unshift(user);

    return { ok: true, message: "Compte cree avec succes.", user: cloneValue(user) };
  }
}

export async function authenticateClientUser(input: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; message: string; user?: ClientUserRecord }> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, message: "Email requis." };
  }

  const user = await findClientUserByEmail(email);
  if (!user) {
    return { ok: false, message: "Email ou mot de passe invalide." };
  }

  if (isDeleted(user)) {
    return { ok: false, message: "Ce compte a ete supprime et ne peut plus se connecter." };
  }

  const validPassword = await compare(input.password, user.passwordHash);
  if (!validPassword) {
    return { ok: false, message: "Email ou mot de passe invalide." };
  }

  return {
    ok: true,
    message: "Connexion reussie.",
    user,
  };
}

export async function isDatabaseBackedClientUsers(): Promise<boolean> {
  return getPrismaClient() !== null;
}
