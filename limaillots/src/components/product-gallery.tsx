"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/store";

interface ProductGalleryProps {
  product: Product;
  className?: string;
  showThumbnails?: boolean;
  compact?: boolean;
  clickCycles?: boolean;
}

const palettePool = [
  ["0f172a", "2563eb", "22c55e"],
  ["4c1d95", "db2777", "f59e0b"],
  ["0f766e", "06b6d4", "eab308"],
  ["7c2d12", "ef4444", "f97316"],
  ["1e3a8a", "8b5cf6", "14b8a6"],
  ["111827", "64748b", "f43f5e"],
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildGeneratedGallery(product: Product): string[] {
  const palette = palettePool[hashSeed(product.slug) % palettePool.length];
  const title = escapeXml(product.name);
  const category = escapeXml(product.category);
  const club = escapeXml(product.clubOrCountry);
  const visual = escapeXml(product.visual);
  const bg = palette[0];
  const accent = palette[1];
  const detail = palette[2];

  return [
    toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#${bg}" />
            <stop offset="55%" stop-color="#${accent}" />
            <stop offset="100%" stop-color="#${detail}" />
          </linearGradient>
        </defs>
        <rect width="1200" height="1400" rx="80" fill="url(#g)" />
        <circle cx="940" cy="180" r="180" fill="white" opacity="0.08" />
        <circle cx="220" cy="1180" r="240" fill="white" opacity="0.05" />
        <path d="M160 250h320l-60 430c-8 58-58 100-117 100H220c-59 0-109-42-117-100l-60-430z" fill="rgba(255,255,255,0.12)" />
        <path d="M430 240h340l-44 380c-10 83-81 146-165 146s-155-63-165-146z" fill="rgba(255,255,255,0.08)" />
        <text x="86" y="140" fill="rgba(255,255,255,0.86)" font-size="56" font-family="Arial, Helvetica, sans-serif" font-weight="700" letter-spacing="8">LIMAILLOTS</text>
        <text x="88" y="1030" fill="rgba(255,255,255,0.72)" font-size="34" font-family="Arial, Helvetica, sans-serif" letter-spacing="3">${category}</text>
        <text x="88" y="1110" fill="#ffffff" font-size="88" font-family="Arial, Helvetica, sans-serif" font-weight="800">${title}</text>
        <text x="88" y="1195" fill="rgba(255,255,255,0.82)" font-size="44" font-family="Arial, Helvetica, sans-serif" font-weight="600">${club}</text>
        <text x="880" y="1220" fill="rgba(255,255,255,0.92)" font-size="180" font-family="Arial, Helvetica, sans-serif" font-weight="900" text-anchor="middle">${visual}</text>
      </svg>
    `),
    toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400">
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#${detail}" />
            <stop offset="100%" stop-color="#${accent}" />
          </linearGradient>
          <pattern id="mesh" width="70" height="70" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.22)" />
            <circle cx="42" cy="28" r="3" fill="rgba(255,255,255,0.16)" />
            <circle cx="22" cy="54" r="3" fill="rgba(255,255,255,0.12)" />
          </pattern>
        </defs>
        <rect width="1200" height="1400" rx="80" fill="url(#g2)" />
        <rect width="1200" height="1400" rx="80" fill="url(#mesh)" />
        <circle cx="150" cy="160" r="120" fill="white" opacity="0.08" />
        <circle cx="1000" cy="1240" r="200" fill="white" opacity="0.08" />
        <text x="80" y="150" fill="#ffffff" font-size="52" font-family="Arial, Helvetica, sans-serif" font-weight="700" letter-spacing="6">DÉTAILS</text>
        <text x="80" y="260" fill="#ffffff" font-size="102" font-family="Arial, Helvetica, sans-serif" font-weight="900">${visual}</text>
        <rect x="80" y="360" width="1040" height="700" rx="54" fill="rgba(255,255,255,0.10)" />
        <text x="130" y="470" fill="#ffffff" font-size="56" font-family="Arial, Helvetica, sans-serif" font-weight="700">Vue matière</text>
        <text x="130" y="560" fill="rgba(255,255,255,0.8)" font-size="34" font-family="Arial, Helvetica, sans-serif">Finition premium, coupe moderne, confort étudiant.</text>
        <text x="130" y="680" fill="#ffffff" font-size="54" font-family="Arial, Helvetica, sans-serif" font-weight="700">${club}</text>
        <text x="130" y="780" fill="rgba(255,255,255,0.82)" font-size="34" font-family="Arial, Helvetica, sans-serif">Clique, swipe ou survole pour faire défiler.</text>
      </svg>
    `),
    toDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400">
        <defs>
          <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#${bg}" />
            <stop offset="100%" stop-color="#${detail}" />
          </linearGradient>
        </defs>
        <rect width="1200" height="1400" rx="80" fill="url(#g3)" />
        <circle cx="980" cy="240" r="250" fill="white" opacity="0.08" />
        <circle cx="260" cy="1160" r="250" fill="white" opacity="0.05" />
        <text x="80" y="150" fill="rgba(255,255,255,0.86)" font-size="50" font-family="Arial, Helvetica, sans-serif" font-weight="700">NOUVEAUTÉ</text>
        <text x="80" y="320" fill="#ffffff" font-size="120" font-family="Arial, Helvetica, sans-serif" font-weight="900">${visual}</text>
        <path d="M120 980c120-170 250-250 420-250 210 0 320 120 520 120 70 0 110-20 140-42v272H120z" fill="rgba(255,255,255,0.12)" />
        <text x="80" y="1120" fill="#ffffff" font-size="74" font-family="Arial, Helvetica, sans-serif" font-weight="800">${title}</text>
        <text x="80" y="1190" fill="rgba(255,255,255,0.84)" font-size="34" font-family="Arial, Helvetica, sans-serif">Edition premium à découvrir maintenant.</text>
      </svg>
    `),
  ];
}

function resolveGallery(product: Product): string[] {
  const provided = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const imageUrl = typeof product.imageUrl === "string" ? product.imageUrl.trim() : "";

  if (provided.length > 0) {
    return provided;
  }

  if (imageUrl.startsWith("data:") || imageUrl.startsWith("/")) {
    return [imageUrl, ...buildGeneratedGallery(product).slice(1)];
  }

  return buildGeneratedGallery(product);
}

export function ProductGallery({
  product,
  className = "",
  showThumbnails = true,
  compact = false,
  clickCycles = true,
}: ProductGalleryProps) {
  const gallery = useMemo(() => resolveGallery(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);


  useEffect(() => {
    if (!isHovering || gallery.length < 2) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % gallery.length);
    }, compact ? 900 : 1200);

    return () => window.clearInterval(interval);
  }, [compact, gallery.length, isHovering]);

  function nextImage() {
    if (gallery.length < 2) return;
    setActiveIndex((current) => (current + 1) % gallery.length);
  }

  const activeImage = gallery[activeIndex % Math.max(gallery.length, 1)] ?? gallery[0] ?? "";

  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
      onClick={clickCycles ? nextImage : undefined}
      role="presentation"
    >
      <div
        className={`relative h-full w-full overflow-hidden ${compact ? "rounded-2xl" : "rounded-[2rem]"}`}
      >
        {activeImage ? (
          <Image
            unoptimized
            src={activeImage}
            alt={product.name}
            fill
            priority={compact ? false : true}
            sizes={compact ? "(min-width:1280px) 28vw, (min-width:768px) 42vw, 100vw" : "(min-width:1024px) 55vw, 100vw"}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${product.gradient} text-4xl font-bold text-white`}>
            {product.visual}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {activeIndex + 1}/{gallery.length}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          Swipe / Hover
        </div>
      </div>

      {showThumbnails && gallery.length > 1 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {gallery.map((image, index) => (
            <button
              key={`${product.id}-${index}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex(index);
              }}
              className={`relative h-20 overflow-hidden rounded-2xl border transition ${
                index === activeIndex
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20"
                  : "border-[var(--border)]"
              }`}
              aria-label={`Voir l'image ${index + 1} du produit`}
            >
              <Image
                unoptimized
                src={image}
                alt={`${product.name} ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}




