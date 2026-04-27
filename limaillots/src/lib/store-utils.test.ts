import { describe, expect, it } from "vitest";
import { products } from "../data/store-data";
import { applyFilters } from "./store-utils";
import { ProductFilters } from "../types/store";

const baseFilters: ProductFilters = {
  search: "",
  category: "Tous",
  priceRange: "Tous",
  size: "Toutes",
  clubOrCountry: "Tous",
  sortBy: "popular",
};

describe("applyFilters", () => {
  it("retourne les produits triés par popularité par défaut", () => {
    const result = applyFilters(products, baseFilters);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].popularity).toBeGreaterThanOrEqual(result[1].popularity);
  });

  it("supporte la recherche tolérante aux fautes", () => {
    const result = applyFilters(products, {
      ...baseFilters,
      search: "frnce exterieur",
    });

    expect(
      result.some((product) => product.slug === "maillot-france-exterieur-24-25"),
    ).toBe(true);
  });

  it("filtre par catégorie, taille et club", () => {
    const result = applyFilters(products, {
      ...baseFilters,
      category: "Crampons",
      size: "42",
      clubOrCountry: "Campus League",
    });

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("crampons-controlpulse-ag");
  });

  it("applique le tri prix croissant", () => {
    const result = applyFilters(products, {
      ...baseFilters,
      sortBy: "price-asc",
    });

    expect(result[0].price).toBeLessThanOrEqual(result[result.length - 1].price);
  });
});
