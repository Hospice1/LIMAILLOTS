import { StarIcon } from "@/components/icons";
import { formatPrice } from "@/lib/store-utils";
import { Product } from "@/types/store";

interface ProductCardProps {
  product: Product;
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

          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </article>
  );
}

