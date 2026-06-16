import Image from "next/image";
import { SiteLanguage, getSiteCopy } from "@/lib/i18n";
import { CategoryItem } from "@/types/store";

interface CategoryGridProps {
  items: CategoryItem[];
  language: SiteLanguage;
  activeLabel: string;
  onSelect: (item: CategoryItem) => void;
}

export function CategoryGrid({ items, language, activeLabel, onSelect }: CategoryGridProps) {
  const copy = getSiteCopy(language);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {copy.categories.kicker}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)] md:text-3xl">
            {copy.categories.title}
          </h2>
        </div>
        <span className="hidden rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-muted)] md:inline-flex">
          {copy.categories.activeFilter}: {activeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {items.map((item) => {
          const isActive = activeLabel === item.label;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="group text-left transition hover:-translate-y-1"
            >
              <div
                className={`relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-3xl shadow-sm ring-2 ring-transparent transition group-hover:scale-[1.03] md:h-24 md:w-24 ${
                  isActive ? "ring-[var(--accent)]/20" : ""
                }`}
              >
                {item.imageSrc ? (
                  <Image
                    src={item.imageSrc}
                    alt={item.label}
                    fill
                    sizes="(min-width: 768px) 96px, 80px"
                    className="object-cover"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${item.gradient} text-white`}>
                    <span aria-hidden="true">{item.visual}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-[var(--text)]">
                {item.label}
              </p>
              {isActive ? <p className="mt-1 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">{copy.categories.active}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
