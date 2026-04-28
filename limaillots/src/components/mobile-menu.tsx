import { CloseIcon } from "@/components/icons";
import { LimaillotsLogo } from "@/components/limaillots-logo";
import { CategoryItem } from "@/types/store";

interface MobileMenuProps {
  open: boolean;
  items: CategoryItem[];
  onClose: () => void;
  onCategorySelect: (item: CategoryItem) => void;
}

export function MobileMenu({
  open,
  items,
  onClose,
  onCategorySelect,
}: MobileMenuProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[86vw] transform border-r border-[var(--border)] bg-[var(--surface)] p-5 transition duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu mobile"
      >
        <div className="mb-5 flex items-center justify-between">
          <LimaillotsLogo className="h-10 w-[168px] text-[var(--text)]" />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)]"
            aria-label="Fermer le menu"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          <a
            href="#"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)]"
            onClick={onClose}
          >
            Accueil
          </a>
          <a
            href="#products"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)]"
            onClick={onClose}
          >
            Boutique
          </a>
          <a
            href="/compte"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)]"
            onClick={onClose}
          >
            Mon espace client
          </a>
          <a
            href="#footer"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)]"
            onClick={onClose}
          >
            Contact
          </a>
        </nav>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Categories
          </p>
          <div className="grid grid-cols-2 gap-2">
            {items.slice(0, 12).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onCategorySelect(item);
                  onClose();
                }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-3 text-left text-xs font-semibold text-[var(--text)]"
              >
                <span className="mr-1" aria-hidden="true">
                  {item.visual}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          © Designed by iamyotto | All rights reserved.
        </p>
      </aside>
    </>
  );
}
