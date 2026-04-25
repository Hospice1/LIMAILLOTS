import { BagIcon, MenuIcon, UserIcon } from "@/components/icons";

interface MainNavbarProps {
  cartCount: number;
  onMenuToggle: () => void;
  onCartToggle: () => void;
}

export function MainNavbar({
  cartCount,
  onMenuToggle,
  onCartToggle,
}: MainNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-center md:h-[4.5rem]">
          <button
            type="button"
            onClick={onMenuToggle}
            className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
            aria-label="Ouvrir le menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <a
            href="#"
            className="font-hero text-xl tracking-[0.35em] text-[var(--text)] md:text-2xl"
            aria-label="Accueil LIMAILLOTS"
          >
            LIMAILLOTS
          </a>

          <div className="absolute right-0 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
              aria-label="Mon compte"
            >
              <UserIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onCartToggle}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
              aria-label="Ouvrir le panier"
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

