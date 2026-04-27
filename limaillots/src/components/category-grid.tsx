<<<<<<< HEAD
﻿import { CategoryItem } from "@/types/store";
=======
﻿import Image from "next/image";
import { CategoryItem } from "@/types/store";
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)

interface CategoryGridProps {
  items: CategoryItem[];
  activeLabel: string;
  onSelect: (item: CategoryItem) => void;
}

export function CategoryGrid({ items, activeLabel, onSelect }: CategoryGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Navigation rapide
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)] md:text-3xl">
            Explore les collections
          </h2>
        </div>
        <span className="hidden rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-muted)] md:inline-flex">
          Filtre actif: {activeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => {
          const isActive = activeLabel === item.label;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-[var(--card-shadow)] transition hover:-translate-y-1 hover:border-[var(--accent)]"
            >
              <div
<<<<<<< HEAD
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-3xl shadow-lg md:h-24 md:w-24`}
              >
                <span aria-hidden="true">{item.visual}</span>
=======
                className={`relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-[var(--surface-muted)] text-3xl shadow-lg ring-4 ring-transparent transition group-hover:scale-[1.03] md:h-24 md:w-24 ${
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
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-[var(--text)] md:text-base">
                {item.label}
              </p>
              <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
                {isActive ? "Actif" : "Voir"}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
<<<<<<< HEAD
}

=======
}
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
