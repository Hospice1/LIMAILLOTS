"use client";

import Link from "next/link";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice } from "@/lib/store-utils";
import { Product } from "@/types/store";

interface WorldCupSectionProps {
  products: Product[];
  onViewAll: () => void;
  onAddToCart: (productId: string) => void;
}

export function WorldCupSection({ products, onViewAll, onAddToCart }: WorldCupSectionProps) {
  const featured = products.slice(0, 4);

  if (featured.length === 0) return null;

  const mainProduct = featured[0];
  const sideProducts = featured.slice(1, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="flex min-h-[26rem] flex-col justify-between rounded-[2rem] bg-[var(--accent)] p-6 text-white shadow-[var(--card-shadow)] md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
              Drop Coupe du Monde
            </p>
            <h2 className="mt-4 max-w-lg text-4xl leading-[0.95] md:text-6xl">
              Les nations passent devant.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/76 md:text-base">
              La boutique est allegee pour montrer d'abord les maillots de selection: France, Maroc et autres nations disponibles.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="mt-8 w-fit rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--accent)]"
          >
            Voir tous les maillots Coupe du Monde
          </button>
        </article>

        <div className="grid gap-4 md:grid-cols-[1fr_0.78fr]">
          <article className="overflow-hidden rounded-[2rem] bg-[var(--surface)] shadow-[var(--card-shadow)]">
            <Link href={`/produit/${mainProduct.slug}`} className="block">
              <ProductGallery product={mainProduct} compact showThumbnails={false} clickCycles={false} className="h-72 w-full md:h-full" />
            </Link>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Selection nationale</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-2xl leading-tight text-[var(--text)]">{mainProduct.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{mainProduct.clubOrCountry}</p>
                </div>
                <p className="font-price shrink-0 text-lg text-[var(--text)]">{formatPrice(mainProduct.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(mainProduct.id)}
                disabled={mainProduct.stock <= 0}
                className="mt-4 rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Ajouter au panier
              </button>
            </div>
          </article>

          <div className="grid gap-4">
            {sideProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produit/${product.slug}`}
                className="grid grid-cols-[6.5rem_1fr] gap-3 rounded-[1.5rem] bg-[var(--surface)] p-3 shadow-[var(--card-shadow)] transition hover:-translate-y-0.5"
              >
                <ProductGallery product={product} compact showThumbnails={false} clickCycles={false} className="h-28 w-full" />
                <div className="min-w-0 py-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent)]">{product.clubOrCountry}</p>
                  <h3 className="mt-1 line-clamp-2 text-sm leading-tight text-[var(--text)]">{product.name}</h3>
                  <p className="font-price mt-2 text-sm text-[var(--text)]">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
