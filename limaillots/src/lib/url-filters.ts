import { ProductFilters } from "@/types/store";

export type TagFilter = "all" | "new" | "promo";

const validSortValues = new Set<ProductFilters["sortBy"]>([
  "popular",
  "newest",
  "price-asc",
  "price-desc",
]);

const validTags = new Set<TagFilter>(["all", "new", "promo"]);

export function parseFilterStateFromSearch(
  search: string,
  defaults: ProductFilters,
): { filters: ProductFilters; tagFilter: TagFilter } {
  const params = new URLSearchParams(search);

  const sortRaw = params.get("sort") as ProductFilters["sortBy"] | null;
  const sortBy = sortRaw && validSortValues.has(sortRaw) ? sortRaw : defaults.sortBy;

  const tagRaw = (params.get("tag") ?? "all") as TagFilter;
  const tagFilter = validTags.has(tagRaw) ? tagRaw : "all";

  return {
    filters: {
      ...defaults,
      search: params.get("q") ?? defaults.search,
      category: params.get("cat") ?? defaults.category,
      priceRange: params.get("price") ?? defaults.priceRange,
      size: params.get("size") ?? defaults.size,
      clubOrCountry: params.get("club") ?? defaults.clubOrCountry,
      sortBy,
    },
    tagFilter,
  };
}

export function buildSearchFromFilters(
  filters: ProductFilters,
  tagFilter: TagFilter,
): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.category !== "Tous") params.set("cat", filters.category);
  if (filters.priceRange !== "Tous") params.set("price", filters.priceRange);
  if (filters.size !== "Toutes") params.set("size", filters.size);
  if (filters.clubOrCountry !== "Tous") params.set("club", filters.clubOrCountry);
  if (filters.sortBy !== "popular") params.set("sort", filters.sortBy);
  if (tagFilter !== "all") params.set("tag", tagFilter);

  const value = params.toString();
  return value.length > 0 ? `?${value}` : "";
}
