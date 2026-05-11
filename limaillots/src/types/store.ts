export type ShopTheme = "light" | "dark";

export type ProductMediaKind = "image" | "video";

export interface ProductMediaItem {
  url: string;
  kind: ProductMediaKind;
  label?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  category: string;
  clubOrCountry: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  isNew?: boolean;
  isPromo?: boolean;
  popularity: number;
  noveltyRank: number;
  sizes: string[];
  visual: string;
  gradient: string;
  media?: ProductMediaItem[];
  images?: string[];
  imageUrl?: string;
  stock: number;
}

export interface CategoryItem {
  id: string;
  label: string;
  visual: string;
  gradient: string;
  imageSrc?: string;
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

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  message: string;
}