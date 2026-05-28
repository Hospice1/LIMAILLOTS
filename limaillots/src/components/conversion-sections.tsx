export function ConversionSections() {
  const packs = [
    "Maillot + chaussettes",
    "Maillot + accessoire campus",
    "Crampons + chaussettes grip",
  ];
  const studentBestSellers = ["Maillots clubs europeens", "Tenues selections nationales", "Chaussettes grip match"];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Pourquoi LIMAILLOTS
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-[var(--text)] md:text-5xl">
            Une boutique pensee pour les etudiants, les fans et les matchs du week-end.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {["Selection football premium", "Commande rapide WhatsApp", "Tailles et disponibilite claires"].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm font-semibold text-[var(--text)]">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-muted)] p-6 shadow-[var(--card-shadow)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Packs etudiants
          </p>
          <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Compose ton pack</h3>
          <div className="mt-5 space-y-3">
            {packs.map((pack) => (
              <div key={pack} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--text)]">{pack}</span>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Sur demande</span>
              </div>
            ))}
          </div>
          <a
            href="https://wa.me/2290191326544"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-full justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
          >
            Commander rapidement sur WhatsApp
          </a>
        </article>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {studentBestSellers.map((item, index) => (
          <article key={item} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Top ventes etudiants 0{index + 1}
            </p>
            <h3 className="mt-2 text-lg font-black text-[var(--text)]">{item}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Selection ideale pour campus, matchs entre amis et supporters exigeants.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
