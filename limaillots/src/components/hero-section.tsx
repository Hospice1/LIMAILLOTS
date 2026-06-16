"use client";

import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons";
import { SiteLanguage, getSiteCopy } from "@/lib/i18n";

interface HeroSectionProps {
  language: SiteLanguage;
  onCtaClick: () => void;
  onQuickCategorySelect: (value: "world-cup" | "clubs") => void;
}

export function HeroSection({ language, onCtaClick, onQuickCategorySelect }: HeroSectionProps) {
  const copy = getSiteCopy(language);

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 pt-7 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:px-8">
      <div className="flex min-h-[32rem] flex-col justify-between rounded-[2rem] bg-[var(--text)] p-6 text-white shadow-[var(--card-shadow)] md:p-8">
        <div>
        <p className="inline-flex rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">
          {copy.hero.badge}
        </p>
        <h1 className="mt-6 max-w-3xl text-5xl font-hero leading-[0.9] text-white md:text-7xl lg:text-8xl">
          {copy.hero.title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/68 md:text-lg">
          {copy.hero.subtitle}
        </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--text)] shadow-lg transition hover:translate-x-0.5"
          >
            {copy.hero.cta}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "world-cup" as const, label: copy.hero.quick.worldCup },
              { value: "clubs" as const, label: copy.hero.quick.clubs },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onQuickCategorySelect(item.value)}
                className="rounded-full border border-white/16 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/12"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="hero-glow absolute -inset-2 -z-10 rounded-[2.5rem]" />
        <div className="relative h-full min-h-[32rem] overflow-hidden rounded-[2rem] bg-[var(--surface)] shadow-[var(--card-shadow)]">
            <VisualTile
              className="h-full min-h-[32rem]"
              imageSrc="/hero-boutique/maillots.jpg"
              label={copy.hero.quick.worldCup}
            />

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/86 px-4 py-3 backdrop-blur-xl">
            <span className="text-sm font-semibold text-zinc-950">Livraison / retrait / confirmation WhatsApp</span>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
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
