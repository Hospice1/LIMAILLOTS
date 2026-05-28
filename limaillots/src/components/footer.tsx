import { LimaillotsLogo } from "@/components/limaillots-logo";
import { SiteLanguage, getSiteCopy } from "@/lib/i18n";

interface FooterProps {
  language: SiteLanguage;
}

export function Footer({ language }: FooterProps) {
  const copy = getSiteCopy(language);

  return (
    <footer
      id="footer"
      className="mt-16 border-t border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <LimaillotsLogo className="h-10 w-[170px] text-[var(--text)]" />
          <p className="mt-3 max-w-sm text-sm text-[var(--text-muted)]">
            LIMAILLOTS equipe les etudiants et fans de football avec des maillots, crampons et accessoires selectionnes. Une boutique rapide, claire et connectee a WhatsApp pour commander sans friction.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
            {copy.footer.linksTitle}
          </h3>
          <nav className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <a href="#" className="block transition hover:text-[var(--accent)]">
              {copy.footer.links.home}
            </a>
            <a href="#products" className="block transition hover:text-[var(--accent)]">
              {copy.footer.links.shop}
            </a>
            <a href="#footer" className="block transition hover:text-[var(--accent)]">
              {copy.footer.links.contact}
            </a>
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
            {copy.footer.contactTitle}
          </h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <a
              href="https://www.instagram.com/limaheribert"
              target="_blank"
              rel="noreferrer"
              className="block transition hover:text-[var(--accent)]"
            >
              Instagram / Facebook
            </a>
            <a
              href="https://www.tiktok.com/@vianneylima5"
              target="_blank"
              rel="noreferrer"
              className="block transition hover:text-[var(--accent)]"
            >
              TikTok
            </a>
            <a
              href="mailto:heribertlima4@gmail.com"
              className="block transition hover:text-[var(--accent)]"
            >
              Email
            </a>
            <a
              href="https://wa.me/2290191326544"
              target="_blank"
              rel="noreferrer"
              className="block transition hover:text-[var(--accent)]"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-3 border-t border-[var(--border)] px-4 py-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:px-6 md:grid-cols-4 lg:px-8">
        {["Livraison disponible", "Support WhatsApp", "Produits verifies", "Packs etudiants"].map((item) => (
          <span key={item} className="rounded-full border border-[var(--border)] px-3 py-2 text-center">{item}</span>
        ))}
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text-muted)]">
        {"\u00A9"} {copy.footer.copyright}
      </div>
    </footer>
  );
}
