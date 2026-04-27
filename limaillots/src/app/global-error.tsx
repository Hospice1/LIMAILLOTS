"use client";

import { LimaillotsLogo } from "@/components/limaillots-logo";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <LimaillotsLogo className="h-14 w-[250px] text-[var(--text)]" />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Erreur critique
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)] md:text-4xl">
            Le service rencontre un incident.
          </h1>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
          >
            Recharger
          </button>
        </main>
      </body>
    </html>
  );
}
