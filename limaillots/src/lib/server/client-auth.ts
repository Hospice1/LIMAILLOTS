import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const CLIENT_SESSION_COOKIE = "limaillots_client_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

interface ClientSessionToken {
  sub: string;
  role: "client";
}

function getSessionSecret(): Uint8Array {
  const configuredSecret = process.env.CLIENT_SESSION_SECRET;

  if (configuredSecret && configuredSecret.length >= 24) {
    return new TextEncoder().encode(configuredSecret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("CLIENT_SESSION_SECRET is missing or too short.");
  }

  return new TextEncoder().encode("dev-only-client-secret-change-before-production");
}

async function signClientToken(clientUserId: string): Promise<string> {
  const secret = getSessionSecret();

  return new SignJWT({ role: "client" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(clientUserId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function establishClientSession(clientUserId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = await signClientToken(clientUserId);

  cookieStore.set({
    name: CLIENT_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearClientSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: CLIENT_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getClientSession(): Promise<ClientSessionToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "client" || typeof payload.sub !== "string") {
      return null;
    }

    return {
      role: "client",
      sub: payload.sub,
    };
  } catch {
    return null;
  }
}
