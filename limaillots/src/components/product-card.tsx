<<<<<<< HEAD
﻿import { StarIcon } from "@/components/icons";
=======
﻿import Link from "next/link";
import { HeartFilledIcon, HeartIcon, StarIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
import { formatPrice } from "@/lib/store-utils";
import { Product } from "@/types/store";

interface ProductCardProps {
  product: Product;
<<<<<<< HEAD
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)] transition hover:-translate-y-1">
      <div className={`relative h-44 bg-gradient-to-br ${product.gradient} p-4 text-white`}>
        <span className="text-4xl" aria-hidden="true">
          {product.visual}
        </span>

        <div className="absolute right-3 top-3 flex gap-2">
          {product.isNew && (
            <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-900">
              Nouveau
            </span>
          )}
          {product.isPromo && (
            <span className="rounded-full bg-zinc-900/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Promo
            </span>
          )}
        </div>

        <p className="absolute bottom-4 right-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          {product.clubOrCountry}
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">{product.name}</h3>
=======
  isWishlisted: boolean;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  href?: string;
}

export function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  href,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const galleryClickCycles = !href;

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)] transition hover:-translate-y-1">
      {href ? (
        <Link
          href={href}
          aria-label={`Voir le produit ${product.name}`}
          className="absolute inset-0 z-10"
        />
      ) : null}

      <ProductGallery
        product={product}
        compact
        showThumbnails={false}
        clickCycles={galleryClickCycles}
        className="h-44 w-full"
      />

      <div className="relative z-20 space-y-4 p-5">
        <div>
          {href ? (
            <h3 className="text-lg font-semibold text-[var(--text)]">{product.name}</h3>
          ) : (
            <Link
              href={`/produit/${product.slug}`}
              className="text-lg font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
            >
              {product.name}
            </Link>
          )}
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
          <p className="mt-1 text-sm text-[var(--text-muted)]">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-[var(--text)]">
            {formatPrice(product.price)}
          </p>
          {product.oldPrice && (
            <p className="text-sm text-[var(--text-muted)] line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-sm font-semibold text-[var(--text)]">
            <StarIcon className="h-3.5 w-3.5 text-amber-400" />
            {product.rating.toFixed(1)}
          </p>

<<<<<<< HEAD
          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Ajouter au panier
          </button>
=======
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition hover:bg-[var(--surface-muted)]"
              aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isWishlisted ? (
                <HeartFilledIcon className="h-4 w-4 text-rose-500" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onAddToCart(product.id)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Indisponible" : "Ajouter"}
            </button>
          </div>
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
        </div>
      </div>
    </article>
  );
<<<<<<< HEAD
}

=======
}
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
