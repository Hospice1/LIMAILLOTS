export type ShopTheme = "light" | "dark";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  clubOrCountry: string;
  price: number;
  oldPrice?: number;
  rating: number;
  isNew?: boolean;
  isPromo?: boolean;
  popularity: number;
  noveltyRank: number;
  sizes: string[];
  visual: string;
  gradient: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  visual: string;
  gradient: string;
  targetCategory?: string;
  targetTag?: "new" | "promo";
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ProductFilters {
  search: string;
  category: string;
  priceRange: string;
  size: string;
  clubOrCountry: string;
  sortBy: "popular" | "newest" | "price-asc" | "price-desc";
}

