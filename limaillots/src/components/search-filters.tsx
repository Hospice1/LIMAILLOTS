import { MoonIcon, SearchIcon, SunIcon } from "@/components/icons";
import { ProductFilters, ShopTheme } from "@/types/store";

interface SearchFiltersProps {
  filters: ProductFilters;
  categories: string[];
  clubsOrCountries: string[];
  sizes: string[];
  theme: ShopTheme;
  resultCount: number;
<<<<<<< HEAD
=======
  wishlistCount: number;
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
  onThemeToggle: () => void;
  onFiltersChange: (update: Partial<ProductFilters>) => void;
}

export function SearchFilters({
  filters,
  categories,
  clubsOrCountries,
  sizes,
  theme,
  resultCount,
<<<<<<< HEAD
=======
  wishlistCount,
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
  onThemeToggle,
  onFiltersChange,
}: SearchFiltersProps) {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]/90 py-4 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <label className="relative flex-1" htmlFor="search-products">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="search-products"
              value={filters.search}
              onChange={(event) => onFiltersChange({ search: event.target.value })}
<<<<<<< HEAD
              placeholder="Rechercher maillot, crampons, accessoire..."
=======
              placeholder="Rechercher maillot, crampons, accessoire (tolérance typo)..."
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
              className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--surface-muted)] pl-10 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <button
            type="button"
            onClick={onThemeToggle}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] transition hover:scale-[1.02]"
            aria-label="Basculer entre mode clair et mode sombre"
          >
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <SelectFilter
            label="Catégorie"
            value={filters.category}
            onChange={(value) => onFiltersChange({ category: value })}
            options={["Tous", ...categories]}
          />
          <SelectFilter
            label="Prix"
            value={filters.priceRange}
            onChange={(value) => onFiltersChange({ priceRange: value })}
            options={["Tous", "<20000", "20000-40000", "40000-70000", ">70000"]}
          />
          <SelectFilter
            label="Taille"
            value={filters.size}
            onChange={(value) => onFiltersChange({ size: value })}
            options={["Toutes", ...sizes]}
          />
          <SelectFilter
            label="Popularité"
            value={filters.sortBy}
            onChange={(value) =>
              onFiltersChange({
                sortBy: value as ProductFilters["sortBy"],
              })
            }
            options={[
              { label: "Popularité", value: "popular" },
              { label: "Nouveautés", value: "newest" },
              { label: "Prix croissant", value: "price-asc" },
              { label: "Prix décroissant", value: "price-desc" },
            ]}
          />
          <SelectFilter
            label="Club / Pays"
            value={filters.clubOrCountry}
            onChange={(value) => onFiltersChange({ clubOrCountry: value })}
            options={["Tous", ...clubsOrCountries]}
          />
        </div>

<<<<<<< HEAD
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {resultCount} produits affichés
        </p>
=======
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
          <p>{resultCount} produits affichés</p>
          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
          <p>{wishlistCount} favoris</p>
        </div>
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
      </div>
    </section>
  );
}

interface SelectFilterProps {
  label: string;
  value: string;
  options: string[] | Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}

function SelectFilter({ label, value, options, onChange }: SelectFilterProps) {
  const mappedOptions = options.map((option) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }
    return option;
  });

  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      >
        {mappedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
<<<<<<< HEAD
}

=======
}
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
