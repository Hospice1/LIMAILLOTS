import { compare, hash } from "bcryptjs";
import { getPrismaClient } from "@/lib/server/prisma";

export interface ClientUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  city: string;
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

async function ensureMemoryStore(): Promise<MemoryClientStore> {
  if (globalThis.limaillotsMemoryClientUsers) {
    return globalThis.limaillotsMemoryClientUsers;
  }

  globalThis.limaillotsMemoryClientUsers = {
    users: [],
  };

  return globalThis.limaillotsMemoryClientUsers;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toRecord(input: {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  city: string;
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
    createdAt:
      typeof input.createdAt === "string"
        ? input.createdAt
        : input.createdAt.toISOString(),
    updatedAt:
      typeof input.updatedAt === "string"
        ? input.updatedAt
        : input.updatedAt.toISOString(),
  };
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

export async function findClientUserByEmail(email: string): Promise<ClientUserRecord | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const prisma = getPrismaClient();

  if (!prisma) {
    return findFromMemoryByEmail(normalizedEmail);
  }

  try {
    const user = await prisma.clientUser.findUnique({
      where: { email: normalizedEmail },
    });

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
    const user = await prisma.clientUser.findUnique({
      where: { id: normalizedId },
    });

    return user ? toRecord(user) : null;
  } catch {
    return findFromMemoryById(normalizedId);
  }
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
    return { ok: false, message: "Un compte existe deja avec cet email." };
  }

  const passwordHash = await hash(password, 12);
  const prisma = getPrismaClient();

  if (!prisma) {
    const memory = await ensureMemoryStore();
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
    const memory = await ensureMemoryStore();
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
