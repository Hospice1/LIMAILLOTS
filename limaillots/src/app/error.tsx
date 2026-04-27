"use client";

import { useEffect } from "react";
import { LimaillotsLogo } from "@/components/limaillots-logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <LimaillotsLogo className="h-14 w-[250px] text-[var(--text)]" />
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        Erreur applicative
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--text)] md:text-4xl">
        Une erreur est survenue.
      </h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--text-muted)] md:text-base">
        Le problème a été capturé. Tu peux relancer l&apos;affichage de cette page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
      >
        Réessayer
      </button>
    </main>
  );
}
