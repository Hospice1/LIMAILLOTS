"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LimaillotsLogo } from "@/components/limaillots-logo";
import {
  loginClient,
  registerClient,
  requestClientRecovery,
} from "@/lib/client-account";

type AuthMode = "login" | "register" | "recovery";

interface ClientAuthPageProps {
  nextPath: string;
}

export function ClientAuthPage({ nextPath }: ClientAuthPageProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [recoveryEmail, setRecoveryEmail] = useState("");

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setFeedback("");
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await loginClient(loginForm.email, loginForm.password);
      if (!result.ok) {
        setFeedback(result.message);
        return;
      }

      setFeedback("Connexion reussie. Redirection...");
      window.setTimeout(() => router.push(nextPath), 400);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (registerForm.password.length < 6) {
      setFeedback("Le mot de passe doit contenir au moins 6 caracteres.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setFeedback("La confirmation du mot de passe est incorrecte.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerClient({
        fullName: registerForm.fullName.trim() || "Client LIMAILLOTS",
        email: registerForm.email,
        phone: registerForm.phone,
        city: registerForm.city,
        password: registerForm.password,
      });

      if (!result.ok) {
        setFeedback(result.message);
        return;
      }

      setFeedback("Compte cree. Redirection...");
      window.setTimeout(() => router.push(nextPath), 400);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!recoveryEmail.trim()) {
      setFeedback("Entre ton email de compte.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await requestClientRecovery(recoveryEmail);
      setFeedback(result.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-10">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)]">
        <LimaillotsLogo className="h-12 w-[220px] text-[var(--text)]" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Compte client
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text)]">
          Connexion / Inscription
        </h1>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${mode === "login" ? "bg-[var(--accent)] text-white" : "text-[var(--text)]"}`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${mode === "register" ? "bg-[var(--accent)] text-white" : "text-[var(--text)]"}`}
          >
            Inscription
          </button>
          <button
            type="button"
            onClick={() => switchMode("recovery")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${mode === "recovery" ? "bg-[var(--accent)] text-white" : "text-[var(--text)]"}`}
          >
            Recuperation
          </button>
        </div>

        {mode === "login" ? (
          <form className="mt-5 space-y-3" onSubmit={(event) => void submitLogin(event)}>
            <Field
              label="Email"
              value={loginForm.email}
              onChange={(value) => setLoginForm((prev) => ({ ...prev, email: value }))}
            />
            <Field
              label="Mot de passe"
              type="password"
              value={loginForm.password}
              onChange={(value) => setLoginForm((prev) => ({ ...prev, password: value }))}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Se connecter
            </button>
          </form>
        ) : null}

        {mode === "register" ? (
          <form
            className="mt-5 grid gap-3 md:grid-cols-2"
            onSubmit={(event) => void submitRegister(event)}
          >
            <Field
              label="Nom complet"
              value={registerForm.fullName}
              onChange={(value) => setRegisterForm((prev) => ({ ...prev, fullName: value }))}
            />
            <Field
              label="Email"
              value={registerForm.email}
              onChange={(value) => setRegisterForm((prev) => ({ ...prev, email: value }))}
            />
            <Field
              label="Telephone"
              value={registerForm.phone}
              onChange={(value) => setRegisterForm((prev) => ({ ...prev, phone: value }))}
            />
            <Field
              label="Ville"
              value={registerForm.city}
              onChange={(value) => setRegisterForm((prev) => ({ ...prev, city: value }))}
            />
            <Field
              label="Mot de passe"
              type="password"
              value={registerForm.password}
              onChange={(value) => setRegisterForm((prev) => ({ ...prev, password: value }))}
            />
            <Field
              label="Confirmation"
              type="password"
              value={registerForm.confirmPassword}
              onChange={(value) => setRegisterForm((prev) => ({ ...prev, confirmPassword: value }))}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2"
            >
              Creer mon compte
            </button>
          </form>
        ) : null}

        {mode === "recovery" ? (
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => void submitRecovery(event)}
          >
            <Field
              label="Email de recuperation"
              value={recoveryEmail}
              onChange={setRecoveryEmail}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Envoyer
            </button>
          </form>
        ) : null}

        {feedback ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">{feedback}</p>
        ) : null}

        <Link href="/" className="mt-4 inline-flex text-xs text-[var(--accent)]">
          Retour boutique
        </Link>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[var(--text)] outline-none"
      />
    </label>
  );
}