export function Footer() {
  return (
    <footer
      id="footer"
      className="mt-16 border-t border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-hero text-xl tracking-[0.3em] text-[var(--text)]">
            LIMAILLOTS
          </p>
          <p className="mt-3 max-w-sm text-sm text-[var(--text-muted)]">
            Boutique football moderne pour étudiants, supporters et joueurs.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
            Liens rapides
          </h3>
          <nav className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <a href="#" className="block transition hover:text-[var(--accent)]">
              Accueil
            </a>
            <a href="#products" className="block transition hover:text-[var(--accent)]">
              Boutique
            </a>
            <a href="#footer" className="block transition hover:text-[var(--accent)]">
              Contact
            </a>
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
            Contact & Réseaux
          </h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>Instagram: @limaillots</p>
            <p>TikTok: @limaillots.store</p>
            <p>Email: contact@limaillots.shop</p>
            <p>WhatsApp: +229 01 98 76 54 32</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

