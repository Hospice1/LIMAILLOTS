import Link from "next/link";
import { HeartFilledIcon, HeartIcon, StarIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice } from "@/lib/store-utils";
import { Product } from "@/types/store";

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  rating: number;
  href?: string;
}

export function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  rating,
  href,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const galleryClickCycles = !href;
  const primaryBadge = product.isPromo
    ? "Promo"
    : product.isNew
      ? "Nouveau"
      : product.popularity >= 90
        ? "Top vente"
        : "";

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] bg-[var(--surface)] shadow-[var(--card-shadow)] transition hover:-translate-y-1">
      {href ? (
        <Link
          href={href}
          aria-label={`Voir le produit ${product.name}`}
          className="absolute inset-0 z-10"
        />
      ) : null}

      <div className="relative">
        <ProductGallery
          product={product}
          compact
          showThumbnails={false}
          clickCycles={galleryClickCycles}
          className="h-64 w-full"
        />
        {primaryBadge ? (
          <div className="absolute left-3 top-3 z-20">
            <span className="rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-950 shadow-sm">
              {primaryBadge}
            </span>
          </div>
        ) : null}
      </div>

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
          <p className="mt-1 text-sm text-[var(--text-muted)]">{product.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)]"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 4 ? (
              <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)]">
                +{product.sizes.length - 4}
              </span>
            ) : null}
          </div>
          {isLowStock ? (
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-red-500">
              Plus que {product.stock}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <p className="font-price text-lg text-[var(--text)]">{formatPrice(product.price)}</p>
          {product.oldPrice && product.oldPrice > product.price ? (
            <p className="font-price text-sm text-[var(--text-muted)] line-through">
              {formatPrice(product.oldPrice)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-sm font-semibold text-[var(--text)]">
            <StarIcon className="h-3.5 w-3.5 text-amber-400" />
            {rating.toFixed(1)}
          </p>

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

            <Link
              href={`/produit/${product.slug}`}
              className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Details
            </Link>

            <button
              type="button"
              onClick={() => onAddToCart(product.id)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Indisponible" : "Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
