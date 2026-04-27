import type { Metadata } from "next";
import { ProductDetailPageClient } from "@/components/product-detail-page-client";
import { products as defaultProducts } from "@/data/store-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://limaillots.vercel.app";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return defaultProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = defaultProducts.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Produit LIMAILLOTS",
      description: "Découvre les produits premium de la boutique LIMAILLOTS.",
      alternates: {
        canonical: `/produit/${slug}`,
      },
      openGraph: {
        title: "Produit LIMAILLOTS",
        description: "Découvre les produits premium de la boutique LIMAILLOTS.",
        url: `${siteUrl}/produit/${slug}`,
        type: "website",
        images: ["/og-limaillots.svg"],
      },
      twitter: {
        title: "Produit LIMAILLOTS",
        description: "Découvre les produits premium de la boutique LIMAILLOTS.",
        images: ["/og-limaillots.svg"],
      },
    };
  }

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: `/produit/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | LIMAILLOTS`,
      description: product.description,
      url: `${siteUrl}/produit/${product.slug}`,
      type: "website",
      images: ["/og-limaillots.svg"],
    },
    twitter: {
      title: `${product.name} | LIMAILLOTS`,
      description: product.description,
      images: ["/og-limaillots.svg"],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = defaultProducts.find((item) => item.slug === slug) ?? null;

  const similarProducts = product
    ? defaultProducts
        .filter((item) => item.category === product.category && item.id !== product.id)
        .slice(0, 3)
    : [];

  return (
    <ProductDetailPageClient
      slug={slug}
      initialProduct={product}
      initialSimilarProducts={similarProducts}
    />
  );
}

