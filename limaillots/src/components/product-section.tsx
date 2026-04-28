"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/store";

interface ProductSectionProps {
  products: Product[];
  wishlistIds: string[];
  ratingByProductId: Record<string, number>;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
}

const INITIAL_VISIBLE_COUNT = 12;

export function ProductSection({
  products,
  wishlistIds,
  ratingByProductId,
  onAddToCart,
  onToggleWishlist,
}: ProductSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCount = isExpanded ? products.length : Math.min(INITIAL_VISIBLE_COUNT, products.length);
  const visibleProducts = products.slice(0, visibleCount);
  const canExpand = products.length > INITIAL_VISIBLE_COUNT && !isExpanded;
  const canCollapse = products.length > INITIAL_VISIBLE_COUNT && isExpanded;

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Boutique
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)] md:text-3xl">
            Produits recommandés
          </h2>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <p className="text-base font-medium text-[var(--text)]">
            Aucun produit ne correspond à ces filtres.
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Modifie les filtres pour afficher davantage d&apos;articles.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                rating={ratingByProductId[product.id] ?? 0}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                href={`/produit/${product.slug}`}
              />
            ))}
          </div>

          {products.length > INITIAL_VISIBLE_COUNT ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {canExpand ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white"
                >
                  Voir plus
                </button>
              ) : null}
              {canCollapse ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold text-[var(--text)]"
                >
                  Voir moins
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
