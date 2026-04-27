import Link from "next/link";
import { LimaillotsLogo } from "@/components/limaillots-logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <LimaillotsLogo className="h-14 w-[250px] text-[var(--text)]" />
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        Erreur 404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--text)] md:text-4xl">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--text-muted)] md:text-base">
        Le lien demandé est introuvable. Reviens à la boutique LIMAILLOTS pour
        continuer tes achats.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
