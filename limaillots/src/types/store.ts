export type ShopTheme = "light" | "dark";

export interface Product {
  id: string;
<<<<<<< HEAD
  name: string;
  description: string;
=======
  slug: string;
  name: string;
  description: string;
  details: string[];
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
  category: string;
  clubOrCountry: string;
  price: number;
  oldPrice?: number;
  isNew?: boolean;
  isPromo?: boolean;
  popularity: number;
  noveltyRank: number;
  sizes: string[];
  visual: string;
  gradient: string;
<<<<<<< HEAD
=======
  images?: string[];
  imageUrl?: string;
  stock: number;
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
}

export interface CategoryItem {
  id: string;
  label: string;
  visual: string;
  gradient: string;
<<<<<<< HEAD
=======
  imageSrc?: string;
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
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
<<<<<<< HEAD
}

=======
}

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  message: string;
}

>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
