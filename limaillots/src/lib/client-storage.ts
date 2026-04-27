import { CartItem } from "@/types/store";

export const CART_STORAGE_KEY = "limaillots-cart";
export const WISHLIST_STORAGE_KEY = "limaillots-wishlist";

export function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        typeof item?.productId === "string" &&
        typeof item?.quantity === "number" &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function readWishlistFromStorage(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

export function writeWishlistToStorage(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
}
