"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LimaillotsLogo } from "@/components/limaillots-logo";
import { resetClientPassword } from "@/lib/client-account";

interface ClientResetPasswordPageProps {
  token: string;
}

export function ClientResetPasswordPage({ token }: ClientResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setFeedback("Lien de recuperation invalide.");
      return;
    }

    if (password.length < 8) {
      setFeedback("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFeedback("La confirmation du mot de passe est incorrecte.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetClientPassword({ token, password });
      setFeedback(result.message);
      setIsDone(result.ok);
      if (result.ok) {
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-10">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)]">
        <LimaillotsLogo className="h-12 w-[220px] text-[var(--text)]" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Recuperation client
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text)]">
          Nouveau mot de passe
        </h1>

        {!isDone ? (
          <form className="mt-6 space-y-3" onSubmit={(event) => void submitReset(event)}>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
              Nouveau mot de passe
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[var(--text)] outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
              Confirmation
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[var(--text)] outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Mise a jour..." : "Mettre a jour"}
            </button>
          </form>
        ) : null}

        {feedback ? <p className="mt-4 text-sm text-[var(--text-muted)]">{feedback}</p> : null}

        <Link href="/compte/connexion" className="mt-4 inline-flex text-xs text-[var(--accent)]">
          Aller a la connexion
        </Link>
      </div>
    </main>
  );
}