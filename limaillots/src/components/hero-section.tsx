"use client";

import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons";
import { SiteLanguage, getSiteCopy } from "@/lib/i18n";

interface HeroSectionProps {
  language: SiteLanguage;
  onCtaClick: () => void;
  onQuickCategorySelect: (value: "Maillots" | "Crampons" | "Accessoires") => void;
}

export function HeroSection({ language, onCtaClick, onQuickCategorySelect }: HeroSectionProps) {
  const copy = getSiteCopy(language);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-8 pt-10 sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
      <div>
        <p className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {copy.hero.badge}
        </p>
        <h1 className="mt-5 text-4xl font-hero font-semibold leading-tight text-[var(--text)] md:text-5xl lg:text-6xl">
          {copy.hero.title}
        </h1>
        <p className="mt-5 max-w-xl text-base text-[var(--text-muted)] md:text-lg">
          {copy.hero.subtitle}
        </p>
        <div className="mt-5 grid max-w-xl grid-cols-3 gap-2">
          {["Nouveautes", "Top ventes", "WhatsApp 24H"].map((label) => (
            <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">LIMAILLOTS</p>
              <p className="mt-1 text-xs font-bold text-[var(--text)]">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:translate-x-0.5"
          >
            {copy.hero.cta}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "Maillots" as const, label: copy.hero.quick.maillots },
              { value: "Crampons" as const, label: copy.hero.quick.crampons },
              { value: "Accessoires" as const, label: copy.hero.quick.accessoires },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onQuickCategorySelect(item.value)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="hero-glow absolute -inset-2 -z-10 rounded-[2.5rem]" />
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] md:p-8">
          <div className="grid grid-cols-2 gap-4">
            <VisualTile
              className="col-span-2 h-44 md:h-52"
              imageSrc="/hero-boutique/maillots.jpg"
              label={copy.hero.quick.maillots}
            />
            <VisualTile
              className="h-36 md:h-40"
              imageSrc="/hero-boutique/crampons.jpg"
              label={copy.hero.quick.crampons}
            />
            <VisualTile
              className="h-36 md:h-40"
              imageSrc="/hero-boutique/accessoires.jpg"
              label={copy.hero.quick.accessoires}
            />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text)]">Livraison / retrait / confirmation WhatsApp</span>
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
        priority={imageSrc.includes("maillots")}
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
