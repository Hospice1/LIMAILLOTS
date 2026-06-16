import { ArrowRightIcon } from "@/components/icons";
import { LimaillotsLogo } from "@/components/limaillots-logo";

interface HomeEntryProps {
  onEnter: () => void;
}

export function HomeEntry({ onEnter }: HomeEntryProps) {
  return (
    <section className="home-entry relative isolate flex min-h-[100svh] overflow-hidden text-[var(--text)]">
      <div className="lab-bg pointer-events-none absolute inset-0 opacity-90" />
      <div className="home-entry-fade home-entry-fade-top pointer-events-none absolute inset-x-0 top-0 h-48" />
      <div className="home-entry-fade home-entry-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-40" />
      <div className="pointer-events-none absolute inset-x-8 top-20 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-16 bottom-24 h-px bg-gradient-to-r from-transparent via-cyan-600/40 to-transparent" />

      <div className="relative z-10 m-auto flex w-full max-w-7xl flex-col items-center px-4 py-14 text-center sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center">
          <LimaillotsLogo className="h-12 w-[210px] text-[var(--text)] sm:h-14 sm:w-[250px]" />
        </div>

        <h1 className="max-w-5xl bg-gradient-to-b from-[var(--text)] via-[var(--accent)] to-[var(--text-muted)] bg-clip-text text-5xl font-black leading-none text-transparent sm:text-7xl lg:text-9xl">
          LIMAILLOTS
        </h1>

        <p className="mt-5 max-w-2xl text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-base">
          Maillots Coupe du Monde et clubs premium pour etudiants fans de
          football
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="mt-9 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(15,118,110,0.28)] transition hover:-translate-y-0.5 hover:brightness-95"
        >
          Entrer dans la boutique
          <ArrowRightIcon className="h-4 w-4" />
        </button>

        <div className="mt-10 flex w-full max-w-xl items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <span>World Cup</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span>Clubs</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span>WhatsApp</span>
        </div>
      </div>
    </section>
  );
}
