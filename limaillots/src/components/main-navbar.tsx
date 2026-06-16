"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BagIcon, MenuIcon, UserIcon } from "@/components/icons";
import { LimaillotsLogo } from "@/components/limaillots-logo";
import { SiteLanguage, getSiteCopy } from "@/lib/i18n";

interface MainNavbarProps {
  cartCount: number;
  language: SiteLanguage;
  onLanguageChange: (language: SiteLanguage) => void;
  onMenuToggle: () => void;
  onCartToggle: () => void;
}

export function MainNavbar({
  cartCount,
  language,
  onLanguageChange,
  onMenuToggle,
  onCartToggle,
}: MainNavbarProps) {
  const [accountHref, setAccountHref] = useState("/compte/connexion");
  const copy = useMemo(() => getSiteCopy(language), [language]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/client/session", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as { authenticated?: boolean };
        if (!isMounted) return;

        setAccountHref(payload.authenticated ? "/compte" : "/compte/connexion");
      } catch {
        if (!isMounted) return;
        setAccountHref("/compte/connexion");
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--bg)]/82 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-14 items-center justify-center md:h-16">
          <button
            type="button"
            onClick={onMenuToggle}
            className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition hover:bg-black/5"
            aria-label={copy.navbar.menuAria}
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center text-[var(--text)]"
            aria-label={copy.navbar.homeAria}
          >
            <LimaillotsLogo className="h-9 w-[158px] md:w-[190px]" />
          </Link>

          <div className="absolute right-0 flex items-center gap-1.5">
            <label className="hidden sm:block" aria-label={copy.navbar.languageLabel}>
              <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as SiteLanguage)}
                className="h-9 rounded-full border border-black/5 bg-white/35 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text)] outline-none"
              >
                <option value="fr">{copy.navbar.languageName.fr}</option>
                <option value="en">{copy.navbar.languageName.en}</option>
                <option value="pt">{copy.navbar.languageName.pt}</option>
              </select>
            </label>

            <Link
              href={accountHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition hover:bg-black/5"
              aria-label={copy.navbar.accountAria}
            >
              <UserIcon className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={onCartToggle}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition hover:bg-black/5"
              aria-label={copy.navbar.cartAria}
            >
              <BagIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

