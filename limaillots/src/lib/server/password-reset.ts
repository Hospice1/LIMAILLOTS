import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { getPrismaClient } from "@/lib/server/prisma";
import { findClientUserByEmail } from "@/lib/server/client-users";

const RESET_TOKEN_TTL_MINUTES = 30;
const RESET_EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "LIMAILLOTS <onboarding@resend.dev>";

interface MemoryResetToken {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

interface MemoryResetStore {
  tokens: MemoryResetToken[];
}

declare global {
  var limaillotsPasswordResetStore: MemoryResetStore | undefined;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createRawToken(): string {
  return randomBytes(32).toString("base64url");
}

function getSiteUrl(requestOrigin?: string): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }
  return requestOrigin || "http://localhost:3000";
}

async function ensureMemoryStore(): Promise<MemoryResetStore> {
  if (globalThis.limaillotsPasswordResetStore) {
    return globalThis.limaillotsPasswordResetStore;
  }

  globalThis.limaillotsPasswordResetStore = { tokens: [] };
  return globalThis.limaillotsPasswordResetStore;
}

async function persistResetToken(email: string, tokenHash: string, expiresAt: Date): Promise<void> {
  const prisma = getPrismaClient();

  if (!prisma) {
    const memory = await ensureMemoryStore();
    memory.tokens = memory.tokens.filter((item) => item.email !== email || item.usedAt);
    memory.tokens.unshift({
      id: `prt-${Date.now().toString(36)}`,
      email,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });
    return;
  }

  await prisma.clientPasswordResetToken.updateMany({
    where: { email, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.clientPasswordResetToken.create({
    data: {
      email,
      tokenHash,
      expiresAt,
    },
  });
}

async function sendPasswordResetEmail(input: {
  email: string;
  resetUrl: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY manquant." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESET_EMAIL_FROM,
      to: input.email,
      subject: "Reinitialisation de ton mot de passe LIMAILLOTS",
      html: `
        <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
          <h1 style="font-size:22px">Reinitialisation LIMAILLOTS</h1>
          <p>Tu as demande a redefinir ton mot de passe.</p>
          <p>Ce lien est valable ${RESET_TOKEN_TTL_MINUTES} minutes et ne peut etre utilise qu'une seule fois.</p>
          <p><a href="${input.resetUrl}" style="display:inline-block;background:#0f766e;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">Creer un nouveau mot de passe</a></p>
          <p>Si tu n'es pas a l'origine de cette demande, ignore simplement cet email.</p>
        </div>
      `,
      text: `Reinitialisation LIMAILLOTS\n\nOuvre ce lien pour creer un nouveau mot de passe: ${input.resetUrl}\n\nLien valable ${RESET_TOKEN_TTL_MINUTES} minutes.`,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    return { sent: false, reason: details || "Envoi email refuse." };
  }

  return { sent: true };
}

export async function requestClientPasswordReset(input: {
  email: string;
  requestOrigin?: string;
}): Promise<{ ok: boolean; message: string; devResetUrl?: string }> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, message: "Email requis." };
  }

  const genericMessage = "Si ce compte existe, un lien de recuperation vient d'etre envoye.";
  const user = await findClientUserByEmail(email);

  if (!user || user.deletedAt) {
    return { ok: true, message: genericMessage };
  }

  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  await persistResetToken(email, tokenHash, expiresAt);

  const resetUrl = `${getSiteUrl(input.requestOrigin)}/compte/reinitialisation?token=${encodeURIComponent(rawToken)}`;
  const emailResult = await sendPasswordResetEmail({ email, resetUrl });

  if (!emailResult.sent && process.env.NODE_ENV !== "production") {
    return {
      ok: true,
      message: `${genericMessage} Mode dev: email non envoye (${emailResult.reason}).`,
      devResetUrl: resetUrl,
    };
  }

  return { ok: true, message: genericMessage };
}

async function findValidToken(token: string): Promise<MemoryResetToken | null> {
  const tokenHash = hashToken(token);
  const prisma = getPrismaClient();

  if (!prisma) {
    const memory = await ensureMemoryStore();
    return memory.tokens.find((item) => item.tokenHash === tokenHash) ?? null;
  }

  const record = await prisma.clientPasswordResetToken.findUnique({
    where: { tokenHash },
  });

  return record
    ? {
        id: record.id,
        email: record.email,
        tokenHash: record.tokenHash,
        expiresAt: record.expiresAt.toISOString(),
        usedAt: record.usedAt?.toISOString(),
        createdAt: record.createdAt.toISOString(),
      }
    : null;
}

async function markTokenUsed(tokenHash: string): Promise<void> {
  const prisma = getPrismaClient();

  if (!prisma) {
    const memory = await ensureMemoryStore();
    memory.tokens = memory.tokens.map((item) =>
      item.tokenHash === tokenHash ? { ...item, usedAt: new Date().toISOString() } : item,
    );
    return;
  }

  await prisma.clientPasswordResetToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });
}

async function updateClientPassword(email: string, password: string): Promise<boolean> {
  const prisma = getPrismaClient();
  const passwordHash = await hash(password, 12);

  if (!prisma) {
    return false;
  }

  await prisma.clientUser.update({
    where: { email },
    data: { passwordHash },
  });
  return true;
}

export async function resetClientPassword(input: {
  token: string;
  password: string;
}): Promise<{ ok: boolean; message: string }> {
  const token = input.token.trim();
  const password = input.password;

  if (!token) {
    return { ok: false, message: "Lien de recuperation invalide." };
  }

  if (password.length < 8) {
    return { ok: false, message: "Le nouveau mot de passe doit contenir au moins 8 caracteres." };
  }

  const resetToken = await findValidToken(token);
  if (!resetToken || resetToken.usedAt) {
    return { ok: false, message: "Lien de recuperation invalide ou deja utilise." };
  }

  if (new Date(resetToken.expiresAt).getTime() < Date.now()) {
    return { ok: false, message: "Lien de recuperation expire. Refais une demande." };
  }

  const user = await findClientUserByEmail(resetToken.email);
  if (!user || user.deletedAt) {
    return { ok: false, message: "Compte introuvable ou inaccessible." };
  }

  const updated = await updateClientPassword(resetToken.email, password);
  if (!updated) {
    return { ok: false, message: "Base de donnees indisponible pour modifier le mot de passe." };
  }

  await markTokenUsed(resetToken.tokenHash);

  return { ok: true, message: "Mot de passe mis a jour. Tu peux maintenant te connecter." };
}