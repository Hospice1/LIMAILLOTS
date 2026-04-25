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
      const searchNeedle = filters.search.trim().toLowerCase();
      const matchesSearch =
        searchNeedle.length === 0 ||
        product.name.toLowerCase().includes(searchNeedle) ||
        product.description.toLowerCase().includes(searchNeedle);

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
      if (filters.sortBy === "price-asc") return a.price - b.price;
      if (filters.sortBy === "price-desc") return b.price - a.price;
      if (filters.sortBy === "newest") return b.noveltyRank - a.noveltyRank;
      return b.popularity - a.popularity;
    });
}

function matchPriceRange(price: number, range: string): boolean {
  if (range === "Tous") return true;
  if (range === "<20000") return price < 20000;
  if (range === "20000-40000") return price >= 20000 && price <= 40000;
  if (range === "40000-70000") return price >= 40000 && price <= 70000;
  if (range === ">70000") return price > 70000;
  return true;
}

