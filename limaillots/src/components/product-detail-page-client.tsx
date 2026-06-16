"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StarIcon } from "@/components/icons";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice } from "@/lib/store-utils";
import { AdminPromoCode } from "@/types/admin";
import { Product } from "@/types/store";

interface ProductDetailPageClientProps {
  slug: string;
  initialProduct: Product | null;
  initialSimilarProducts: Product[];
}

interface StoreStateResponse {
  ok?: boolean;
  data?: {
    products?: Product[];
    promoCodes?: AdminPromoCode[];
  };
}

export function ProductDetailPageClient({
  slug,
  initialProduct,
  initialSimilarProducts,
}: ProductDetailPageClientProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [similarProducts, setSimilarProducts] = useState<Product[]>(initialSimilarProducts);
  const [isResolved, setIsResolved] = useState(Boolean(initialProduct));

  useEffect(() => {
    async function syncFromServer() {
      try {
        const response = await fetch("/api/store/state", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as StoreStateResponse;

        if (!response.ok || !payload.ok || !payload.data?.products) {
          setIsResolved(true);
          return;
        }

        const resolvedProduct = payload.data.products.find((item) => item.slug === slug) ?? initialProduct;

        if (!resolvedProduct) {
          setProduct(null);
          setSimilarProducts([]);
          setIsResolved(true);
          return;
        }

        const resolvedSimilar = payload.data.products
          .filter(
            (item) => item.category === resolvedProduct.category && item.id !== resolvedProduct.id,
          )
          .slice(0, 3);

        setProduct(resolvedProduct);
        setSimilarProducts(resolvedSimilar);
        setIsResolved(true);
      } catch {
        setIsResolved(true);
      }
    }

    void syncFromServer();
  }, [initialProduct, slug]);

  if (!isResolved) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-10 w-36 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        <div className="mt-6 grid gap-7 lg:grid-cols-[1.1fr_1fr]">
          <div className="min-h-[20rem] animate-pulse rounded-[2rem] bg-[var(--surface-muted)]" />
          <div className="min-h-[20rem] animate-pulse rounded-[2rem] bg-[var(--surface-muted)]" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-3xl font-semibold text-[var(--text)]">Produit introuvable</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Ce lien ne correspond a aucun produit actif dans la boutique.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
        >
          Retour a la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
      >
        Retour boutique
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
        <ProductGallery product={product} className="min-h-[30rem] lg:min-h-[38rem]" />

        <div className="rounded-[2rem] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {product.clubOrCountry}
          </p>
          <h1 className="mt-2 text-4xl leading-tight text-[var(--text)] md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-sm font-bold text-[var(--text)]">
              <StarIcon className="h-4 w-4 text-amber-400" />
              {(product.rating ?? 0).toFixed(1)}/5
            </span>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--accent)]">Avis verifie apres moderation</span>
          </div>
          <p className="mt-3 text-sm text-[var(--text-muted)] md:text-base">{product.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="font-price text-2xl text-[var(--text)]">{formatPrice(product.price)}</span>
            {product.oldPrice ? (
              <span className="font-price text-base text-[var(--text-muted)] line-through">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}
            >
              {product.stock > 0 ? `${product.stock} en stock` : "Rupture"}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Tailles disponibles</p>
            <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-bold text-[var(--text)]"
              >
                {size}
              </span>
            ))}
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {["Livraison ou retrait", "Confirmation WhatsApp", "Produit verifie", "Support taille"].map((item) => (
              <div key={item} className="rounded-2xl bg-[var(--surface-muted)] px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text)]">
                {item}
              </div>
            ))}
          </div>

          <ul className="mt-6 space-y-2 text-sm text-[var(--text-muted)]">
            {product.details.map((detail) => (
              <li key={detail} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <ProductDetailActions productId={product.id} stock={product.stock} />
          </div>
          <a
            href={`https://wa.me/2290191326544?text=${encodeURIComponent(`Bonjour LIMAILLOTS, je veux des informations sur ${product.name}`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex w-full justify-center rounded-full border border-[var(--border)] px-6 py-3 text-sm font-bold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Demander sur WhatsApp
          </a>
        </div>
      </section>

      {similarProducts.length > 0 ? (
        <section className="mt-12 border-t border-[var(--border)] pt-8">
          <h2 className="text-3xl text-[var(--text)]">Produits similaires</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/produit/${item.slug}`}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] transition hover:-translate-y-1"
              >
                <ProductGallery product={item} compact showThumbnails={false} clickCycles={false} className="h-28 w-full" />
                <p className="mt-3 text-sm font-semibold text-[var(--text)]">{item.name}</p>
                <p className="font-price mt-1 text-xs text-[var(--text-muted)]">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
