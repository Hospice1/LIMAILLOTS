"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/store";

interface NewArrivalsRailProps {
  products: Product[];
  wishlistIds: string[];
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
}

export function NewArrivalsRail({
  products,
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
}: NewArrivalsRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || products.length === 0) return undefined;

    let frame = 0;
    let lastTime = 0;

    const loop = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && rail.scrollWidth > rail.clientWidth + 8) {
        rail.scrollLeft += delta * 0.05;
        const maxScroll = rail.scrollWidth - rail.clientWidth;
        if (rail.scrollLeft >= maxScroll - 2) {
          rail.scrollLeft = 0;
        }
      }

      frame = window.requestAnimationFrame(loop);
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [isPaused, products.length]);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-2 pb-8 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-3 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text)] md:text-3xl">
            Nouveautés en mouvement
          </h2>
        </div>
        <Link
          href="#products"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]"
        >
          Voir la boutique
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div
        ref={railRef}
        onPointerEnter={() => setIsPaused(true)}
        onPointerLeave={() => setIsPaused(false)}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[320px] shrink-0 snap-start">
            <ProductCard
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              href={`/produit/${product.slug}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

