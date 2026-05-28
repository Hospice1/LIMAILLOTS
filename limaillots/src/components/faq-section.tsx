export function FaqSection() {
  const faqs = [
    {
      question: "Comment se passe la livraison ?",
      answer: "Tu choisis livraison ou retrait pendant la commande. L'adresse est envoyee avec le recapitulatif WhatsApp.",
    },
    {
      question: "Comment payer ?",
      answer: "La commande est confirmee sur WhatsApp avec le vendeur. Les modalites de paiement sont validees avant livraison.",
    },
    {
      question: "Comment choisir la taille ?",
      answer: "Les tailles disponibles sont affichees sur chaque produit. Le support WhatsApp peut confirmer avant validation.",
    },
    {
      question: "Les retours sont possibles ?",
      answer: "Les echanges sont traites au cas par cas si le produit est non porte et signale rapidement apres reception.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">FAQ</p>
        <h2 className="mt-2 text-3xl font-black text-[var(--text)]">Livraison, paiement, tailles</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <summary className="cursor-pointer text-sm font-bold text-[var(--text)]">{faq.question}</summary>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
