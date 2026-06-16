"use client";

import { useState } from "react";
import { MoonIcon, SearchIcon, SunIcon } from "@/components/icons";
import { SiteLanguage, getSiteCopy } from "@/lib/i18n";
import { ProductFilters, ShopTheme } from "@/types/store";

interface SearchFiltersProps {
  filters: ProductFilters;
  categories: string[];
  clubsOrCountries: string[];
  sizes: string[];
  theme: ShopTheme;
  language: SiteLanguage;
  resultCount: number;
  wishlistCount: number;
  onThemeToggle: () => void;
  onFiltersChange: (update: Partial<ProductFilters>) => void;
}

export function SearchFilters({
  filters,
  categories,
  clubsOrCountries,
  sizes,
  theme,
  language,
  resultCount,
  wishlistCount,
  onThemeToggle,
  onFiltersChange,
}: SearchFiltersProps) {
  const copy = getSiteCopy(language);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const filterControls = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
      <SelectFilter
        label={copy.search.labels.category}
        value={filters.category}
        onChange={(value) => onFiltersChange({ category: value })}
        options={[{ label: copy.search.all, value: "Tous" }, ...categories.map((category) => ({ label: category, value: category }))]}
      />
      <SelectFilter
        label={copy.search.labels.price}
        value={filters.priceRange}
        onChange={(value) => onFiltersChange({ priceRange: value })}
        options={[
          { label: copy.search.all, value: "Tous" },
          { label: "<20000", value: "<20000" },
          { label: "20000-40000", value: "20000-40000" },
          { label: "40000-70000", value: "40000-70000" },
          { label: ">70000", value: ">70000" },
        ]}
      />
      <SelectFilter
        label={copy.search.labels.size}
        value={filters.size}
        onChange={(value) => onFiltersChange({ size: value })}
        options={[{ label: copy.search.allSizes, value: "Toutes" }, ...sizes.map((size) => ({ label: size, value: size }))]}
      />
      <SelectFilter
        label={copy.search.labels.sort}
        value={filters.sortBy}
        onChange={(value) =>
          onFiltersChange({
            sortBy: value as ProductFilters["sortBy"],
          })
        }
        options={[
          { label: copy.search.sortOptions.popular, value: "popular" },
          { label: copy.search.sortOptions.newest, value: "newest" },
          { label: copy.search.sortOptions.priceAsc, value: "price-asc" },
          { label: copy.search.sortOptions.priceDesc, value: "price-desc" },
        ]}
      />
      <SelectFilter
        label={copy.search.labels.clubCountry}
        value={filters.clubOrCountry}
        onChange={(value) => onFiltersChange({ clubOrCountry: value })}
        options={[{ label: copy.search.all, value: "Tous" }, ...clubsOrCountries.map((entry) => ({ label: entry, value: entry }))]}
      />
    </div>
  );

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
              placeholder={copy.search.placeholder}
              className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--surface-muted)] pl-10 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen((open) => !open)}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--text)]"
          >
            Filtres
          </button>

          <button
            type="button"
            onClick={onThemeToggle}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] transition hover:scale-[1.02]"
            aria-label={copy.search.themeAria}
          >
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {isMobileFiltersOpen ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--card-shadow)]">
            {filterControls}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
          <p>{resultCount} {copy.search.results}</p>
          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
          <p>{wishlistCount} {copy.search.favorites}</p>
        </div>
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
}
