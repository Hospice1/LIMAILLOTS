import { ArrowRightIcon } from "@/components/icons";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-8 pt-10 sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
      <div>
        <p className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Boutique football premium
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-[var(--text)] md:text-5xl lg:text-6xl">
          LIMAILLOTS, la nouvelle base des étudiants fans de foot.
        </h1>
        <p className="mt-5 max-w-xl text-base text-[var(--text-muted)] md:text-lg">
          Maillots iconiques, crampons performants et accessoires utiles au
          quotidien. Design propre, sélection moderne et expérience d’achat
          fluide sur mobile et desktop.
        </p>
        <button
          type="button"
          onClick={onCtaClick}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:translate-x-0.5"
        >
          Acheter maintenant
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <div className="hero-glow absolute -inset-2 -z-10 rounded-[2.5rem]" />
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] md:p-8">
          <div className="grid grid-cols-2 gap-4">
            <VisualTile className="col-span-2 from-sky-500 via-blue-600 to-indigo-700" label="Maillots" emoji="??" />
            <VisualTile className="from-emerald-500 via-cyan-500 to-blue-700" label="Crampons" emoji="??" />
            <VisualTile className="from-fuchsia-500 via-pink-500 to-rose-600" label="Accessoires" emoji="??" />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text)]">
              Livraison Campus Express
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              24H
            </span>
          </div>

          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 animate-float rounded-full bg-[var(--accent)]/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 animate-float-slow rounded-full bg-sky-500/20 blur-2xl" />
        </div>
      </div>
    </section>
  );
}

interface VisualTileProps {
  className: string;
  emoji: string;
  label: string;
}

function VisualTile({ className, emoji, label }: VisualTileProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-md ${className}`}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/20 blur-xl" />
    </article>
  );
}

