<<<<<<< HEAD
﻿import { ArrowRightIcon } from "@/components/icons";
=======
import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons";
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)

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
<<<<<<< HEAD
        <p className="mt-5 max-w-xl text-base text-[var(--text-muted)] md:text-lg">
          Maillots iconiques, crampons performants et accessoires utiles au
          quotidien. Design propre, sélection moderne et expérience d’achat
          fluide sur mobile et desktop.
        </p>
=======

>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
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
<<<<<<< HEAD
            <VisualTile className="col-span-2 from-sky-500 via-blue-600 to-indigo-700" label="Maillots" emoji="??" />
            <VisualTile className="from-emerald-500 via-cyan-500 to-blue-700" label="Crampons" emoji="??" />
            <VisualTile className="from-fuchsia-500 via-pink-500 to-rose-600" label="Accessoires" emoji="??" />
=======
            <VisualTile
              className="col-span-2 h-44 md:h-52"
              imageSrc="/hero-boutique/maillots.jpg"
              label="Maillots"
            />
            <VisualTile
              className="h-36 md:h-40"
              imageSrc="/hero-boutique/crampons.jpg"
              label="Crampons"
            />
            <VisualTile
              className="h-36 md:h-40"
              imageSrc="/hero-boutique/accessoires.jpg"
              label="Accessoires"
            />
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
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
<<<<<<< HEAD
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

=======
  imageSrc: string;
  label: string;
}

function VisualTile({ className, imageSrc, label }: VisualTileProps) {
  return (
    <article className={`relative overflow-hidden rounded-3xl shadow-md ${className}`}>
      <Image
        src={imageSrc}
        alt={label}
        fill
        priority={label === "Maillots"}
        sizes="(min-width: 768px) 40vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      <p className="absolute bottom-4 left-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
        {label}
      </p>
    </article>
  );
}
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
