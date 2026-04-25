"use client";

import { useEffect, useMemo, useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { MainNavbar } from "@/components/main-navbar";
import { MobileMenu } from "@/components/mobile-menu";
import { ProductSection } from "@/components/product-section";
import { PromoBanner } from "@/components/promo-banner";
import { SearchFilters } from "@/components/search-filters";
import { categoryItems, products, promoMessage } from "@/data/store-data";
import { applyFilters } from "@/lib/store-utils";
import { CartItem, Product, ProductFilters, ShopTheme } from "@/types/store";

const defaultFilters: ProductFilters = {
  search: "",
  category: "Tous",
  priceRange: "Tous",
  size: "Toutes",
  clubOrCountry: "Tous",
  sortBy: "popular",
};

export default function Home() {
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [tagFilter, setTagFilter] = useState<"all" | "new" | "promo">("all");
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("Tous");
  const [theme, setTheme] = useState<ShopTheme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("limaillots-theme");
    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : "light";
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [],
  );

  const clubsOrCountries = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.clubOrCountry))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [],
  );

  const sizes = useMemo(
    () =>
      Array.from(new Set(products.flatMap((product) => product.sizes))).sort(
        (a, b) => a.localeCompare(b, "fr", { numeric: true }),
      ),
    [],
  );

  const filteredProducts = useMemo(() => {
    const baseProducts = applyFilters(products, filters);

    if (tagFilter === "new") {
      return baseProducts.filter((product) => product.isNew);
    }

    if (tagFilter === "promo") {
      return baseProducts.filter((product) => product.isPromo);
    }

    return baseProducts;
  }, [filters, tagFilter]);

  const cartProducts = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);
          if (!product) return null;
          return { product, quantity: item.quantity };
        })
        .filter((item): item is { product: Product; quantity: number } => item !== null),
    [cartItems],
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () =>
      cartProducts.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cartProducts],
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("limaillots-theme", theme);
  }, [theme]);

  function updateFilters(update: Partial<ProductFilters>) {
    setFilters((previous) => ({ ...previous, ...update }));
    if (update.category && update.category !== "Tous") {
      setTagFilter("all");
      setActiveCategoryLabel(update.category);
    }
  }

  function handleCategorySelect(item: (typeof categoryItems)[number]) {
    setActiveCategoryLabel(item.label);

    const targetCategory = item.targetCategory;
    if (targetCategory) {
      setTagFilter("all");
      setFilters((previous) => ({ ...previous, category: targetCategory }));
      return;
    }

    const targetTag = item.targetTag;
    if (targetTag) {
      setTagFilter(targetTag);
      if (targetTag === "new") {
        setFilters((previous) => ({
          ...previous,
          sortBy: "newest",
          category: "Tous",
        }));
      }
      if (targetTag === "promo") {
        setFilters((previous) => ({ ...previous, category: "Tous" }));
      }
    }
  }

  function addToCart(productId: string) {
    setCartItems((previous) => {
      const existing = previous.find((item) => item.productId === productId);
      if (existing) {
        return previous.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...previous, { productId, quantity: 1 }];
    });

    setIsCartOpen(true);
  }

  function incrementQuantity(productId: string) {
    setCartItems((previous) =>
      previous.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decrementQuantity(productId: string) {
    setCartItems((previous) =>
      previous
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCartItems((previous) =>
      previous.filter((item) => item.productId !== productId),
    );
  }

  function jumpToProducts() {
    const section = document.getElementById("products");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <PromoBanner message={promoMessage} />

      <MainNavbar
        cartCount={totalItems}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onCartToggle={() => setIsCartOpen((open) => !open)}
      />

      <SearchFilters
        filters={filters}
        categories={categoryOptions}
        clubsOrCountries={clubsOrCountries}
        sizes={sizes}
        theme={theme}
        resultCount={filteredProducts.length}
        onThemeToggle={() =>
          setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light",
          )
        }
        onFiltersChange={updateFilters}
      />

      <main>
        <HeroSection onCtaClick={jumpToProducts} />

        <CategoryGrid
          items={categoryItems}
          activeLabel={activeCategoryLabel}
          onSelect={handleCategorySelect}
        />

        <ProductSection products={filteredProducts} onAddToCart={addToCart} />
      </main>

      <Footer />

      <MobileMenu
        open={isMenuOpen}
        items={categoryItems}
        onClose={() => setIsMenuOpen(false)}
        onCategorySelect={handleCategorySelect}
      />

      <CartDrawer
        open={isCartOpen}
        items={cartProducts}
        totalItems={totalItems}
        totalPrice={totalPrice}
        onClose={() => setIsCartOpen(false)}
        onIncrement={incrementQuantity}
        onDecrement={decrementQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}


