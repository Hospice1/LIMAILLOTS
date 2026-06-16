export function TrustStrip() {
  const items = [
    {
      title: "Livraison disponible",
      text: "Retrait ou livraison selon ta zone, confirmation rapide sur WhatsApp.",
    },
    {
      title: "Paiement flexible",
      text: "Commande validee par WhatsApp, paiement confirme avec le vendeur.",
    },
    {
      title: "Produits verifies",
      text: "Maillots Coupe du Monde et clubs controles avant validation.",
    },
    {
      title: "Support rapide",
      text: "Assistance directe pour tailles, disponibilite et suivi commande.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--card-shadow)] md:grid-cols-4">
        {items.map((item, index) => (
          <article
            key={item.title}
            className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-muted)] p-4"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
              0{index + 1}
            </p>
            <h3 className="mt-2 text-sm font-bold text-[var(--text)]">{item.title}</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
