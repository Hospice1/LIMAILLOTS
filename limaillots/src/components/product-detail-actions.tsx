"use client";

import { useState } from "react";
import {
  readCartFromStorage,
  readWishlistFromStorage,
  writeCartToStorage,
  writeWishlistToStorage,
} from "@/lib/client-storage";

interface ProductDetailActionsProps {
  productId: string;
  stock: number;
}

export function ProductDetailActions({
  productId,
  stock,
}: ProductDetailActionsProps) {
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return readWishlistFromStorage().includes(productId);
  });
  const [feedback, setFeedback] = useState("");

  function emitStorageSync() {
    window.dispatchEvent(new Event("limaillots-storage-sync"));
  }

  function handleAddToCart() {
    if (stock <= 0) {
      setFeedback("Rupture de stock sur cet article.");
      return;
    }

    const currentCart = readCartFromStorage();
    const currentLine = currentCart.find((item) => item.productId === productId);
    const currentQty = currentLine?.quantity ?? 0;

    if (currentQty >= stock) {
      setFeedback("Stock maximum atteint pour ce produit.");
      return;
    }

    const nextCart = currentLine
      ? currentCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      : [...currentCart, { productId, quantity: 1 }];

    writeCartToStorage(nextCart);
    emitStorageSync();
    setFeedback("Produit ajouté au panier.");
  }

  function handleWishlistToggle() {
    const currentWishlist = readWishlistFromStorage();

    if (currentWishlist.includes(productId)) {
      const nextWishlist = currentWishlist.filter((id) => id !== productId);
      writeWishlistToStorage(nextWishlist);
      setIsWishlisted(false);
      setFeedback("Retiré de ta wishlist.");
      emitStorageSync();
      return;
    }

    const nextWishlist = [...currentWishlist, productId];
    writeWishlistToStorage(nextWishlist);
    setIsWishlisted(true);
    setFeedback("Ajouté à ta wishlist.");
    emitStorageSync();
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {stock > 0 ? "Ajouter au panier" : "Indisponible"}
        </button>

        <button
          type="button"
          onClick={handleWishlistToggle}
          className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
        >
          {isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
        </button>
      </div>

      {feedback ? (
        <p className="text-sm text-[var(--text-muted)]">{feedback}</p>
      ) : null}
    </div>
  );
}
