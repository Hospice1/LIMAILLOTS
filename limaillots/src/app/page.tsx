"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { HomeEntry } from "@/components/home-entry";
import { HeroSection } from "@/components/hero-section";
import { NewArrivalsRail } from "@/components/new-arrivals-rail";
import { MainNavbar } from "@/components/main-navbar";
import { MobileMenu } from "@/components/mobile-menu";
import { PromoBanner } from "@/components/promo-banner";
import { SearchFilters } from "@/components/search-filters";
import { TrustStrip } from "@/components/trust-strip";
import { WorldCupSection } from "@/components/world-cup-section";
import {
  categoryItems,
  products as fallbackProducts,
  promoCodes as fallbackPromoCodes,
} from "@/data/store-data";
import { createDefaultAdminStateData } from "@/data/admin-defaults";
import {
  readCartFromStorage,
  readWishlistFromStorage,
  writeCartToStorage,
  writeWishlistToStorage,
} from "@/lib/client-storage";
import {
  buildWhatsAppOrderUrl,
  downloadOrderPdf,
  type OrderExportData,
} from "@/lib/order-export";
import { applyFilters } from "@/lib/store-utils";
import {
  buildSearchFromFilters,
  parseFilterStateFromSearch,
  TagFilter,
} from "@/lib/url-filters";
import { detectPreferredLanguage, SiteLanguage } from "@/lib/i18n";
import {
  AdminMarqueeSettings,
  AdminOrder,
  AdminPromoCode,
} from "@/types/admin";
import { CartItem, CategoryItem, CheckoutCustomer, Product, ProductFilters, ShopTheme } from "@/types/store";

const CategoryGrid = dynamic(
  () =>
    import("@/components/category-grid").then((module) => module.CategoryGrid),
  {
    loading: () => (
      <div className="mx-auto h-56 max-w-7xl animate-pulse rounded-3xl bg-[var(--surface)]" />
    ),
  },
);

const ProductSection = dynamic(
  () =>
    import("@/components/product-section").then(
      (module) => module.ProductSection,
    ),
  {
    loading: () => (
      <div className="mx-auto h-72 max-w-7xl animate-pulse rounded-3xl bg-[var(--surface)]" />
    ),
  },
);

const defaultFilters: ProductFilters = {
  search: "",
  category: "Tous",
  priceRange: "Tous",
  size: "Toutes",
  clubOrCountry: "Tous",
  sortBy: "popular",
};

type StoreFocus = "all" | "world-cup" | "clubs";

const clubCategories = new Set([
  "Clubs de LaLiga",
  "Premier League",
  "Ligue 1",
  "Serie A",
  "Bundesliga",
  "Liga Portugal",
]);

function isWorldCupProduct(product: Product) {
  return product.category === "Internationaux";
}

function isClubProduct(product: Product) {
  return clubCategories.has(product.category);
}

function isFeaturedJersey(product: Product) {
  return isWorldCupProduct(product) || isClubProduct(product);
}

function getFocusLabel(focus: StoreFocus) {
  if (focus === "world-cup") return "Coupe du Monde";
  if (focus === "clubs") return "Clubs";
  return "Coupe du Monde & Clubs";
}

function categoryFocus(category: string): StoreFocus {
  if (category === "Internationaux") return "world-cup";
  if (clubCategories.has(category)) return "clubs";
  return "all";
}

const fallbackPromoState: AdminPromoCode[] = fallbackPromoCodes.map(
  (promo, index) => ({
    id: `fallback-promo-${index + 1}`,
    code: promo.code,
    discountPercent: promo.discountPercent,
    minSubtotal: promo.minSubtotal,
    usageLimit: 9999,
    usedCount: 0,
    isActive: true,
    createdAt: "2026-01-01",
  }),
);

const fallbackMarquee: AdminMarqueeSettings = {
  promoCode: fallbackPromoState[0]?.code ?? "LIMAILL0T5",
  message: `10% OFF POUR TOUTES COMMANDES AVEC LE CODE PROMO "${fallbackPromoState[0]?.code ?? "LIMAILL0T5"}"`,
};

function getInitialFilterState(): {
  filters: ProductFilters;
  tagFilter: TagFilter;
} {
  if (typeof window === "undefined") {
    return { filters: defaultFilters, tagFilter: "all" };
  }

  return parseFilterStateFromSearch(window.location.search, defaultFilters);
}

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const [initialFilterState] = useState(getInitialFilterState);
  const [filters, setFilters] = useState<ProductFilters>(
    initialFilterState.filters,
  );
  const [tagFilter, setTagFilter] = useState<TagFilter>(
    initialFilterState.tagFilter,
  );

  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [promoCodes, setPromoCodes] =
    useState<AdminPromoCode[]>(fallbackPromoState);
  const [, setOrders] = useState<AdminOrder[]>(
    () => createDefaultAdminStateData().orders,
  );
  const [, setDatabaseBacked] = useState(false);
  const [, setStoreError] = useState("");

  const [theme, setTheme] = useState<ShopTheme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("limaillots-theme");
    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : "light";
  });

  const [language, setLanguage] = useState<SiteLanguage>(() => {
    if (typeof window === "undefined") {
      return "fr";
    }

    const storedLanguage = window.localStorage.getItem("limaillots-language");
    if (
      storedLanguage === "fr" ||
      storedLanguage === "en" ||
      storedLanguage === "pt"
    ) {
      return storedLanguage;
    }

    return detectPreferredLanguage(window.navigator.language);
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readCartFromStorage(),
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    readWishlistFromStorage(),
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [storeFocus, setStoreFocus] = useState<StoreFocus>("all");
  const [hasEnteredShop, setHasEnteredShop] = useState(false);
  const [hasResolvedEntry, setHasResolvedEntry] = useState(false);

  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [promoMessageText, setPromoMessageText] = useState("");
  const [marquee, setMarquee] = useState<AdminMarqueeSettings>(fallbackMarquee);

  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [checkoutConfirmation, setCheckoutConfirmation] = useState<
    { order: OrderExportData; whatsappUrl: string } | null
  >(null);

  const refreshStoreState = useCallback(async () => {
    try {
      const response = await fetch("/api/store/state", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        data?: {
          products?: Product[];
          promoCodes?: AdminPromoCode[];
          marquee?: AdminMarqueeSettings;
          orders?: AdminOrder[];
        };
        databaseBacked?: boolean;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error("Impossible de charger la boutique.");
      }

      if (
        Array.isArray(payload.data.products) &&
        payload.data.products.length > 0
      ) {
        setProducts(payload.data.products);
      }

      if (
        Array.isArray(payload.data.promoCodes) &&
        payload.data.promoCodes.length > 0
      ) {
        setPromoCodes(payload.data.promoCodes);
      }

      if (
        payload.data.marquee &&
        typeof payload.data.marquee.message === "string"
      ) {
        setMarquee(payload.data.marquee);
      }

      if (Array.isArray(payload.data.orders)) {
        setOrders(payload.data.orders);
      }

      setDatabaseBacked(Boolean(payload.databaseBacked));
      setStoreError("");
    } catch {
      setStoreError(
        "Mode hors base active: affichage des donnees de demonstration.",
      );
    }
  }, []);
  const featuredProducts = useMemo(
    () => products.filter(isFeaturedJersey),
    [products],
  );

  const focusedProducts = useMemo(() => {
    if (storeFocus === "world-cup") return featuredProducts.filter(isWorldCupProduct);
    if (storeFocus === "clubs") return featuredProducts.filter(isClubProduct);
    return featuredProducts;
  }, [featuredProducts, storeFocus]);

  const worldCupProducts = useMemo(
    () => featuredProducts.filter(isWorldCupProduct),
    [featuredProducts],
  );

  const newArrivalProducts = useMemo(
    () =>
      [...featuredProducts]
        .filter((product) => product.isNew || isWorldCupProduct(product))
        .sort((a, b) => {
          const worldCupPriority = Number(isWorldCupProduct(b)) - Number(isWorldCupProduct(a));
          if (worldCupPriority !== 0) return worldCupPriority;
          return b.noveltyRank - a.noveltyRank;
        })
        .slice(0, 8),
    [featuredProducts],
  );

  const focusedCategoryItems = useMemo<CategoryItem[]>(() => {
    const allowedIds = new Set([
      "internationaux",
      "clubs",
      "laliga",
      "premierleague",
      "ligue1",
      "seriea",
      "bundesliga",
    ]);

    return categoryItems
      .filter((item) => allowedIds.has(item.id))
      .map((item) =>
        item.id === "internationaux"
          ? { ...item, label: "Coupe du Monde" }
          : item.id === "clubs"
            ? { ...item, label: "Clubs", targetCategory: undefined }
            : item,
      );
  }, []);

  const categoryOptions = useMemo(
    () => Array.from(new Set(featuredProducts.map((product) => product.category))),
    [featuredProducts],
  );

  const clubsOrCountries = useMemo(
    () =>
      Array.from(
        new Set(featuredProducts.map((product) => product.clubOrCountry)),
      ).sort((a, b) => a.localeCompare(b)),
    [featuredProducts],
  );

  const sizes = useMemo(
    () =>
      Array.from(new Set(featuredProducts.flatMap((product) => product.sizes))).sort(
        (a, b) => a.localeCompare(b, "fr", { numeric: true }),
      ),
    [featuredProducts],
  );

  const productRatingById = useMemo(() => {
    return Object.fromEntries(
      products.map((product) => {
        const rating = Number(product.rating ?? 0);
        return [
          product.id,
          Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0,
        ];
      }),
    ) as Record<string, number>;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const baseProducts = applyFilters(focusedProducts, filters);

    if (tagFilter === "new") {
      return baseProducts.filter((product) => product.isNew);
    }

    if (tagFilter === "promo") {
      return baseProducts.filter((product) => product.isPromo);
    }

    return baseProducts;
  }, [filters, focusedProducts, tagFilter]);

  const activeCategoryLabel = useMemo(() => {
    if (filters.category !== "Tous") {
      if (filters.category === "Internationaux") return "Coupe du Monde";
      return filters.category;
    }

    if (tagFilter === "new") return "Nouveautes";
    if (tagFilter === "promo") return "Promotions";
    return getFocusLabel(storeFocus);
  }, [filters.category, storeFocus, tagFilter]);

  const cartProducts = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find(
            (candidate) => candidate.id === item.productId,
          );
          if (!product) return null;

          const quantity = Math.min(item.quantity, Math.max(product.stock, 0));
          if (quantity <= 0) return null;

          return { product, quantity };
        })
        .filter(
          (item): item is { product: Product; quantity: number } =>
            item !== null,
        ),
    [cartItems, products],
  );

  const totalItems = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.quantity, 0),
    [cartProducts],
  );

  const totalPrice = useMemo(
    () =>
      cartProducts.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cartProducts],
  );

  const activePromo = useMemo(() => {
    if (!appliedPromoCode) {
      return null;
    }

    const promo = promoCodes.find((item) => item.code === appliedPromoCode);
    if (!promo) return null;
    if (!promo.isActive) return null;
    if (promo.usedCount >= promo.usageLimit) return null;
    if (totalPrice < promo.minSubtotal) return null;

    return promo;
  }, [appliedPromoCode, promoCodes, totalPrice]);

  const promoMessageForDrawer = useMemo(() => {
    if (!appliedPromoCode) {
      return promoMessageText;
    }

    if (activePromo) {
      return promoMessageText;
    }

    const promo = promoCodes.find((item) => item.code === appliedPromoCode);
    if (!promo) {
      return "Code promo invalide.";
    }

    if (!promo.isActive) {
      return "Ce code promo est actuellement desactive.";
    }

    if (promo.usedCount >= promo.usageLimit) {
      return "Ce code promo a atteint sa limite d'utilisation.";
    }

    if (totalPrice < promo.minSubtotal) {
      return `Ce code est disponible a partir de ${promo.minSubtotal.toLocaleString("fr-FR")} XOF.`;
    }

    return promoMessageText;
  }, [activePromo, appliedPromoCode, promoCodes, promoMessageText, totalPrice]);

  const discountAmount = useMemo(
    () => Math.round((totalPrice * (activePromo?.discountPercent ?? 0)) / 100),
    [activePromo, totalPrice],
  );

  const finalPrice = Math.max(totalPrice - discountAmount, 0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("limaillots-theme", theme);
  }, [theme]);

  useEffect(() => {
    const entryTimer = window.setTimeout(() => {
      setHasEnteredShop(window.localStorage.getItem("limaillots-intro-seen") === "true");
      setHasResolvedEntry(true);
    }, 0);

    return () => window.clearTimeout(entryTimer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    localStorage.setItem("limaillots-language", language);
  }, [language]);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => {
      void refreshStoreState();
    }, 0);

    const interval = window.setInterval(() => {
      void refreshStoreState();
    }, 45000);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, [refreshStoreState]);

  useEffect(() => {
    writeCartToStorage(cartItems);

    const pendingItems = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const syncTimeout = window.setTimeout(() => {
      void fetch("/api/client/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pendingItems }),
      });
    }, 250);

    return () => {
      window.clearTimeout(syncTimeout);
    };
  }, [cartItems]);

  useEffect(() => {
    writeWishlistToStorage(wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    const search = buildSearchFromFilters(filters, tagFilter);

    if (typeof window !== "undefined" && window.location.search === search) {
      return;
    }

    router.replace(`${pathname}${search}`, { scroll: false });
  }, [filters, pathname, router, tagFilter]);

  useEffect(() => {
    const syncFromStorage = () => {
      setCartItems(readCartFromStorage());
      setWishlistIds(readWishlistFromStorage());
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(
      "limaillots-storage-sync",
      syncFromStorage as EventListener,
    );

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(
        "limaillots-storage-sync",
        syncFromStorage as EventListener,
      );
    };
  }, []);
  function updateFilters(update: Partial<ProductFilters>) {
    setFilters((previous) => ({ ...previous, ...update }));

    if (update.category && update.category !== "Tous") {
      setTagFilter("all");
      setStoreFocus(categoryFocus(update.category));
      return;
    }

    if (update.category === "Tous") {
      setStoreFocus("all");
    }
  }

  function handleCategorySelect(item: CategoryItem) {
    if (item.id === "clubs") {
      setStoreFocus("clubs");
      setTagFilter("all");
      setFilters((previous) => ({ ...previous, category: "Tous", search: "", sortBy: "popular" }));
      window.requestAnimationFrame(jumpToProducts);
      return;
    }

    const targetCategory = item.targetCategory;
    if (targetCategory) {
      setStoreFocus(categoryFocus(targetCategory));
      setTagFilter("all");
      setFilters((previous) => ({ ...previous, category: targetCategory }));
      window.requestAnimationFrame(jumpToProducts);
      return;
    }

    const targetTag = item.targetTag;
    if (!targetTag) {
      return;
    }

    setTagFilter(targetTag);
    setStoreFocus("all");
    window.requestAnimationFrame(jumpToProducts);

    if (targetTag === "new") {
      setFilters((previous) => ({
        ...previous,
        sortBy: "newest",
        category: "Tous",
      }));
      return;
    }

    setFilters((previous) => ({ ...previous, category: "Tous" }));
  }

  function handleHeroQuickCategorySelect(
    value: "world-cup" | "clubs",
  ) {
    setTagFilter("all");
    setStoreFocus(value);
    setFilters((previous) => ({
      ...previous,
      search: "",
      category: value === "world-cup" ? "Internationaux" : "Tous",
      sortBy: "popular",
    }));
    window.requestAnimationFrame(jumpToProducts);
  }
  function addToCart(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product || product.stock <= 0) return;

    setCartItems((previous) => {
      const existing = previous.find((item) => item.productId === productId);

      if (existing) {
        if (existing.quantity >= product.stock) {
          return previous;
        }

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
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setCartItems((previous) =>
      previous.map((item) => {
        if (item.productId !== productId) return item;
        if (item.quantity >= product.stock) return item;
        return { ...item, quantity: item.quantity + 1 };
      }),
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

  function toggleWishlist(productId: string) {
    setWishlistIds((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );
  }

  async function applyPromo(code: string) {
    if (totalPrice <= 0) {
      setPromoMessageText(
        "Ajoute au moins un produit avant d'appliquer un code.",
      );
      return;
    }

    setIsApplyingPromo(true);

    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          subtotal: totalPrice,
        }),
      });

      const result = (await response.json()) as {
        valid: boolean;
        code: string;
        discountPercent: number;
        message: string;
      };

      if (!response.ok || !result.valid) {
        setAppliedPromoCode("");
        setPromoMessageText(result.message || "Code promo invalide.");
        return;
      }

      setAppliedPromoCode(result.code);
      setPromoMessageText(result.message);
    } catch {
      setAppliedPromoCode("");
      setPromoMessageText("Impossible de valider le code pour le moment.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  async function handleCheckout(customer: CheckoutCustomer) {
    if (cartItems.length === 0) {
      return;
    }

    const orderedItems = cartProducts.map(({ product, quantity }) => ({
      name: product.name,
      quantity,
      unitPrice: product.price,
    }));

    try {
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          wishlistIds,
          promoCode: activePromo?.code,
          customer,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message: string;
        orderId?: string;
        subtotal?: number;
        discountAmount?: number;
        finalPrice?: number;
        appliedPromoCode?: string;
        products: Product[];
        promoCodes: AdminPromoCode[];
      };

      if (!response.ok || !payload.ok) {
        setPromoMessageText(payload.message || "Commande impossible.");
        await refreshStoreState();
        return;
      }

      const orderExport: OrderExportData = {
        orderId: payload.orderId ?? `CMD-${Date.now().toString(36).toUpperCase()}`,
        customer,
        items: orderedItems,
        subtotal: payload.subtotal ?? totalPrice,
        discountAmount: payload.discountAmount ?? discountAmount,
        finalPrice: payload.finalPrice ?? finalPrice,
        promoCode: payload.appliedPromoCode || activePromo?.code,
      };

      downloadOrderPdf(orderExport);
      const whatsappUrl = buildWhatsAppOrderUrl(orderExport);
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setCheckoutConfirmation({ order: orderExport, whatsappUrl });

      if (Array.isArray(payload.products) && payload.products.length > 0) {
        setProducts(payload.products);
      }

      if (Array.isArray(payload.promoCodes) && payload.promoCodes.length > 0) {
        setPromoCodes(payload.promoCodes);
      }

      setCartItems([]);
      setAppliedPromoCode("");
      setPromoMessageText(payload.message || "Commande envoyee sur WhatsApp.");
      setIsCartOpen(false);
    } catch {
      setPromoMessageText(
        "Impossible de finaliser la commande pour le moment.",
      );
    }
  }
  function enterBoutique() {
    window.localStorage.setItem("limaillots-intro-seen", "true");
    setHasEnteredShop(true);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function jumpToProducts() {
    const section = document.getElementById("products");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (!hasResolvedEntry) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300" />
    );
  }

  if (!hasEnteredShop) {
    return (
      <div className="min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
        <HomeEntry onEnter={enterBoutique} />
      </div>
    );
  }

  return (
    <div
      id="boutique"
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300"
    >
        <PromoBanner message={marquee.message || fallbackMarquee.message} />

        <MainNavbar
          cartCount={totalItems}
          language={language}
          onLanguageChange={setLanguage}
          onMenuToggle={() => setIsMenuOpen((open) => !open)}
          onCartToggle={() => setIsCartOpen((open) => !open)}
        />

        <SearchFilters
          filters={filters}
          language={language}
          categories={categoryOptions}
          clubsOrCountries={clubsOrCountries}
          sizes={sizes}
          theme={theme}
          resultCount={filteredProducts.length}
          wishlistCount={wishlistIds.length}
          onThemeToggle={() =>
            setTheme((currentTheme) =>
              currentTheme === "light" ? "dark" : "light",
            )
          }
          onFiltersChange={updateFilters}
        />

        <main>
          <HeroSection
            language={language}
            onCtaClick={jumpToProducts}
            onQuickCategorySelect={handleHeroQuickCategorySelect}
          />

          <TrustStrip />

          <WorldCupSection
            products={worldCupProducts}
            onViewAll={() => handleHeroQuickCategorySelect("world-cup")}
            onAddToCart={addToCart}
          />

          <NewArrivalsRail
            products={newArrivalProducts}
            language={language}
            wishlistIds={wishlistIds}
            ratingByProductId={productRatingById}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
          />

          <CategoryGrid
            items={focusedCategoryItems}
            language={language}
            activeLabel={activeCategoryLabel}
            onSelect={handleCategorySelect}
          />

          <ProductSection
            products={filteredProducts}
            language={language}
            wishlistIds={wishlistIds}
            ratingByProductId={productRatingById}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
          />
        </main>

        <Footer language={language} />

        <MobileMenu
          open={isMenuOpen}
          items={focusedCategoryItems}
          language={language}
          onClose={() => setIsMenuOpen(false)}
          onCategorySelect={handleCategorySelect}
        />

        <CartDrawer
          open={isCartOpen}
          language={language}
          items={cartProducts}
          totalItems={totalItems}
          totalPrice={totalPrice}
          discountAmount={discountAmount}
          finalPrice={finalPrice}
          appliedPromoCode={activePromo?.code ?? ""}
          promoMessage={promoMessageForDrawer}
          isApplyingPromo={isApplyingPromo}
          onClose={() => setIsCartOpen(false)}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
          onRemove={removeFromCart}
          onApplyPromo={applyPromo}
          onCheckout={handleCheckout}
        />
        {checkoutConfirmation ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <article className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                Commande preparee
              </p>
              <h2 className="mt-3 text-2xl font-black text-[var(--text)]">
                Bon telecharge, WhatsApp ouvert
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                Le bon de commande {checkoutConfirmation.order.orderId} a ete telecharge. Si WhatsApp ne s&apos;est pas ouvert automatiquement, utilise le bouton ci-dessous.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={checkoutConfirmation.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
                >
                  Ouvrir WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    downloadOrderPdf(checkoutConfirmation.order);
                  }}
                  className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--text)]"
                >
                  Re-telecharger le bon
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutConfirmation(null)}
                  className="text-sm font-semibold text-[var(--text-muted)]"
                >
                  Fermer
                </button>
              </div>
            </article>
          </div>
        ) : null}
    </div>
  );
}
