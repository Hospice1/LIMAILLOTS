export interface ClientProfileInput {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  password: string;
}

interface ApiAuthResponse {
  ok?: boolean;
  message?: string;
}

interface SessionResponse {
  authenticated?: boolean;
  user?: {
    email?: string;
    fullName?: string;
    phone?: string;
    city?: string;
  };
}

export async function getClientSession(): Promise<SessionResponse> {
  const response = await fetch("/api/client/session", {
    method: "GET",
    cache: "no-store",
  });

  return (await response.json()) as SessionResponse;
}

export async function getClientSessionEmail(): Promise<string> {
  const session = await getClientSession();
  return session.authenticated && session.user?.email ? session.user.email : "";
}

export async function loginClient(email: string, password: string): Promise<{ ok: boolean; message: string }> {
  const response = await fetch("/api/client/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as ApiAuthResponse;

  return {
    ok: Boolean(response.ok && payload.ok),
    message: payload.message ?? "Connexion impossible.",
  };
}

export async function registerClient(input: ClientProfileInput): Promise<{ ok: boolean; message: string }> {
  const response = await fetch("/api/client/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiAuthResponse;

  return {
    ok: Boolean(response.ok && payload.ok),
    message: payload.message ?? "Inscription impossible.",
  };
}

export async function requestClientRecovery(email: string): Promise<{ ok: boolean; message: string }> {
  const response = await fetch("/api/client/auth/recovery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const payload = (await response.json()) as ApiAuthResponse;

  return {
    ok: Boolean(response.ok && payload.ok),
    message: payload.message ?? "Recuperation impossible.",
  };
}

export async function logoutClient(): Promise<void> {
  await fetch("/api/client/auth/logout", {
    method: "POST",
  });
}
