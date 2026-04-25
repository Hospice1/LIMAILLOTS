import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/store";

interface ProductSectionProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export function ProductSection({ products, onAddToCart }: ProductSectionProps) {
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
        <p className="hidden text-sm text-[var(--text-muted)] md:block">
          Sélection modernisée pour étudiants et fans de football.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <p className="text-base font-medium text-[var(--text)]">
            Aucun produit ne correspond à ces filtres.
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Modifie les filtres pour afficher davantage d’articles.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}

