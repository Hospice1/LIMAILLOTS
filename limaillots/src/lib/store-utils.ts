import { Product, ProductFilters } from "@/types/store";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  return products
    .filter((product) => {
      const matchesSearch = matchesProductSearch(product, filters.search);

      const matchesCategory =
        filters.category === "Tous" || product.category === filters.category;

      const matchesSize =
        filters.size === "Toutes" || product.sizes.includes(filters.size);

      const matchesClub =
        filters.clubOrCountry === "Tous" ||
        product.clubOrCountry === filters.clubOrCountry;

      const matchesPrice = matchPriceRange(product.price, filters.priceRange);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSize &&
        matchesClub &&
        matchesPrice
      );
    })
    .sort((a, b) => {
      if (filters.sortBy === "price-asc") {
        return a.price - b.price || b.popularity - a.popularity;
      }

      if (filters.sortBy === "price-desc") {
        return b.price - a.price || b.popularity - a.popularity;
      }

      if (filters.sortBy === "newest") {
        return b.noveltyRank - a.noveltyRank || b.popularity - a.popularity;
      }

      return b.popularity - a.popularity || b.noveltyRank - a.noveltyRank;
    });
}

export function findProductBySlug(slug: string, products: Product[]): Product | undefined {
  return products.find((product) => product.slug === slug);
}

function matchPriceRange(price: number, range: string): boolean {
  if (range === "Tous") return true;
  if (range === "<20000") return price < 20000;
  if (range === "20000-40000") return price >= 20000 && price <= 40000;
  if (range === "40000-70000") return price >= 40000 && price <= 70000;
  if (range === ">70000") return price > 70000;
  return true;
}

function matchesProductSearch(product: Product, rawSearch: string): boolean {
  const search = normalizeText(rawSearch.trim());
  if (!search) return true;

  const haystack = normalizeText(
    [
      product.name,
      product.description,
      product.category,
      product.clubOrCountry,
      ...product.details,
    ].join(" "),
  );

  if (haystack.includes(search)) {
    return true;
  }

  const queryTokens = tokenize(search);
  const words = tokenize(haystack);

  return queryTokens.every((token) =>
    words.some((word) => word.includes(token) || isFuzzyNear(token, word)),
  );
}

function tokenize(value: string): string[] {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isFuzzyNear(token: string, word: string): boolean {
  if (!token || !word) return false;

  const maxDistance = token.length <= 4 ? 1 : 2;

  if (Math.abs(token.length - word.length) > maxDistance) {
    return false;
  }

  return levenshtein(token, word) <= maxDistance;
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

