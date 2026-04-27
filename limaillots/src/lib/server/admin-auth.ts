import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_SESSION_COOKIE = "limaillots_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

interface AdminSessionToken {
  sub: string;
  role: "admin";
}

function getSessionSecret(): Uint8Array {
  const configuredSecret = process.env.ADMIN_SESSION_SECRET;

  if (configuredSecret && configuredSecret.length >= 24) {
    return new TextEncoder().encode(configuredSecret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short.");
  }

  return new TextEncoder().encode("dev-only-secret-change-before-production");
}

async function signAdminToken(adminUserId: string): Promise<string> {
  const secret = getSessionSecret();

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminUserId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function establishAdminSession(adminUserId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = await signAdminToken(adminUserId);

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getAdminSession(): Promise<AdminSessionToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "admin" || typeof payload.sub !== "string") {
      return null;
    }

    return {
      role: "admin",
      sub: payload.sub,
    };
  } catch {
    return null;
  }
}
