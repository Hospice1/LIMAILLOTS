import { PrismaClient } from "@prisma/client";

declare global {

  var limaillotsPrisma: PrismaClient | undefined;
}

export function hasDatabaseUrl(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
}

export function getPrismaClient(): PrismaClient | null {
  if (!hasDatabaseUrl()) {
    return null;
  }

  if (globalThis.limaillotsPrisma) {
    return globalThis.limaillotsPrisma;
  }

  const prisma = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.limaillotsPrisma = prisma;
  }

  return prisma;
}
