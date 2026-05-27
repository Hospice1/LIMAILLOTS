"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductGallery } from "@/components/product-gallery";
import { LimaillotsLogo } from "@/components/limaillots-logo";
import { AdminReviewsPanel, type AdminReviewItem } from "@/components/admin/admin-reviews-panel";
import { formatPrice } from "@/lib/store-utils";
import { AdminClient, AdminDatabase, AdminPromoCode, AdminSalesPoint, ReviewStatus } from "@/types/admin";
import { categoryItems } from "@/data/store-data";
import { Product, ProductMediaItem } from "@/types/store";


type AdminTab = "overview" | "products" | "clients" | "reviews" | "promos" | "security";

type ProductEditorState = {
  productId: string;
  name: string;
  categoryMode: "existing" | "new";
  category: string;
  customCategory: string;
  clubOrCountry: string;
  description: string;
  sizes: string;
  price: string;
  oldPrice: string;
  stock: string;
  media: ProductMediaItem[];
  visual: string;
  isPromo: boolean;
  isNew: boolean;
};

type ProductFormState = {
  name: string;
  category: string;
  newCategory: string;
  clubOrCountry: string;
  description: string;
  sizes: string;
  price: string;
  oldPrice: string;
  stock: string;
  media: ProductMediaItem[];
};

const gradientPool = [
  "from-blue-500 via-indigo-500 to-cyan-700",
  "from-rose-500 via-orange-500 to-amber-600",
  "from-emerald-500 via-teal-500 to-cyan-700",
  "from-fuchsia-500 via-pink-500 to-rose-700",
  "from-zinc-500 via-slate-600 to-zinc-800",
];

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "Vue globale" },
  { id: "products", label: "Produits" },
  { id: "clients", label: "Clients" },
  { id: "reviews", label: "Avis" },
  { id: "promos", label: "Codes promo" },
  { id: "security", label: "Securite" },
];

const emptyDatabase: AdminDatabase = {
  products: [],
  clients: [],
  promoCodes: [],
  marquee: {
    promoCode: "LIMAILL0T5",
    message: "10% OFF POUR TOUTES COMMANDES AVEC LE CODE PROMO \"LIMAILL0T5\"",
  },
  sales: [],
  orders: [],
  changeHistory: [],
  settings: {
    adminEmail: "",
    recoveryEmail: "",
    updatedAt: new Date().toISOString(),
  },
};

function createEmptyMedia(): ProductMediaItem[] {
  return [];
}

function normalizeMediaKind(url: string, kind?: ProductMediaItem["kind"]): ProductMediaItem["kind"] {
  if (kind === "video") return "video";
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url)) return "video";
  return "image";
}

function normalizeMediaItems(items: Array<ProductMediaItem | string> | undefined): ProductMediaItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return Array.from(
    new Map(
      items
        .map((item) => {
          if (typeof item === "string") {
            const url = item.trim();
            if (!url) return null;
            return [url, { url, kind: normalizeMediaKind(url) } as ProductMediaItem] as const;
          }

          const url = item.url.trim();
          if (!url) return null;
          return [url, { url, kind: normalizeMediaKind(url, item.kind), label: item.label } as ProductMediaItem] as const;
        })
        .filter((entry): entry is readonly [string, ProductMediaItem] => Boolean(entry)),
    ).values(),
  );
}

function mediaSignature(items: ProductMediaItem[]): string {
  return items.map((item) => `${item.kind}:${item.url}`).join("|");
}

function mediaToLegacyImages(items: ProductMediaItem[]): string[] {
  return items.filter((item) => item.kind === "image").map((item) => item.url);
}

function extractProductMedia(product: Pick<Product, "media" | "imageUrl" | "images">): ProductMediaItem[] {
  if (Array.isArray(product.media) && product.media.length > 0) {
    return normalizeMediaItems(product.media);
  }

  const legacyUrls = [product.imageUrl ?? "", ...(product.images ?? [])].map((item) => item.trim()).filter(Boolean);
  return normalizeMediaItems(legacyUrls);
}

function createEmptyProductEditorState(product?: Product | null): ProductEditorState {
  if (!product) {
    return {
      productId: "",
      name: "",
      categoryMode: "existing",
      category: "Internationaux",
      customCategory: "",
      clubOrCountry: "Universel",
      description: "",
      sizes: "M,L,XL",
      price: "29990",
      oldPrice: "",
      stock: "10",
      media: createEmptyMedia(),
      visual: "",
      isPromo: false,
      isNew: false,
    };
  }

  return {
    productId: product.id,
    name: product.name,
    categoryMode: "existing",
    category: product.category,
    customCategory: "",
    clubOrCountry: product.clubOrCountry,
    description: product.description,
    sizes: product.sizes.join(","),
    price: String(product.price),
    oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    stock: String(product.stock),
    media: extractProductMedia(product),
    visual: product.visual,
    isPromo: Boolean(product.isPromo),
    isNew: Boolean(product.isNew),
  };
}

function parseOptionalNumber(value: string): number | undefined {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : undefined;
}

function uploadFilesToBlob(files: File[], folder: string): Promise<ProductMediaItem[]> {
  const formData = new FormData();
  formData.set("folder", folder);
  files.slice(0, 6).forEach((file) => formData.append("files", file));

  return fetch("/api/uploads", {
    method: "POST",
    body: formData,
  }).then(async (response) => {
    const payload = (await response.json()) as {
      ok?: boolean;
      media?: ProductMediaItem[];
      urls?: string[];
      message?: string;
    };

    const media = Array.isArray(payload.media)
      ? payload.media
      : Array.isArray(payload.urls)
        ? payload.urls.map((url) => ({
            url,
            kind: /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url) ? ("video" as const) : ("image" as const),
          }))
        : [];

    if (!response.ok || !payload.ok || media.length === 0) {
      throw new Error(payload.message ?? "Upload impossible.");
    }

    return media;
  });
}

function hasProductChanges(editor: ProductEditorState, current: Product): boolean {
  const resolvedCategory = editor.categoryMode === "new"
    ? editor.customCategory.trim()
    : editor.category.trim();
  const editorMedia = normalizeMediaItems(editor.media);
  const currentMedia = extractProductMedia(current);

  return (
    editor.name.trim() !== current.name
    || editor.description.trim() !== current.description
    || (resolvedCategory || current.category) !== current.category
    || (editor.clubOrCountry.trim() || current.clubOrCountry) !== current.clubOrCountry
    || (Number(editor.price) > 0 ? Number(editor.price) : current.price) !== current.price
    || (parseOptionalNumber(editor.oldPrice) ?? undefined) !== current.oldPrice
    || (Number(editor.stock) >= 0 ? Number(editor.stock) : current.stock) !== current.stock
    || editor.sizes.split(",").map((item) => item.trim()).filter(Boolean).join(",") !== current.sizes.join(",")
    || editor.visual.trim() !== current.visual
    || editor.isPromo !== current.isPromo
    || editor.isNew !== current.isNew
    || mediaSignature(editorMedia) !== mediaSignature(currentMedia)
  );
}

function summarizeProductChange(before: Product, after: Product): string {
  const changes: string[] = [];

  if (before.name !== after.name) changes.push("nom");
  if (before.description !== after.description) changes.push("description");
  if (before.category !== after.category) changes.push("categorie");
  if (before.clubOrCountry !== after.clubOrCountry) changes.push("club/pays");
  if (before.price !== after.price) changes.push("prix");
  if (before.oldPrice !== after.oldPrice) changes.push("ancien prix");
  if (before.stock !== after.stock) changes.push("stock");
  if (before.isPromo !== after.isPromo) changes.push("promo");
  if (before.isNew !== after.isNew) changes.push("nouveau");
  if (mediaSignature(extractProductMedia(before)) !== mediaSignature(extractProductMedia(after))) changes.push("medias");
  if (before.visual !== after.visual) changes.push("visuel");

  return changes.length > 0
    ? `Produit modifiÃ©: ${after.name} (${changes.join(", ")})`
    : `Produit modifiÃ©: ${after.name}`;
}

function buildProductPatchFromEditor(editor: ProductEditorState, current: Product): Partial<Product> {
  const resolvedCategory = editor.categoryMode === "new"
    ? editor.customCategory.trim()
    : editor.category.trim();
  const media = normalizeMediaItems(editor.media);
  const legacyImages = mediaToLegacyImages(media);
  const primaryImage = media.find((item) => item.kind === "image")?.url ?? media[0]?.url;
  const oldPrice = parseOptionalNumber(editor.oldPrice);
  const price = Number(editor.price);
  const stock = Number(editor.stock);

  return {
    name: editor.name.trim() || current.name,
    description: editor.description.trim() || current.description,
    category: resolvedCategory || current.category,
    clubOrCountry: editor.clubOrCountry.trim() || current.clubOrCountry,
    price: Number.isFinite(price) && price > 0 ? price : current.price,
    oldPrice,
    stock: Number.isFinite(stock) && stock >= 0 ? stock : current.stock,
    sizes: editor.sizes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    visual: editor.visual.trim() || current.visual,
    isPromo: editor.isPromo,
    isNew: editor.isNew,
    media,
    imageUrl: primaryImage,
    images: legacyImages.length > 0 ? legacyImages : undefined,
  };
}

export function AdminDashboard() {
  const [db, setDb] = useState<AdminDatabase>(emptyDatabase);
  const [isAuth, setIsAuth] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [databaseBacked, setDatabaseBacked] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [newProduct, setNewProduct] = useState<ProductFormState>({
    name: "",
    category: "Internationaux",
    newCategory: "",
    clubOrCountry: "Universel",
    description: "",
    sizes: "M,L,XL",
    price: "29990",
    oldPrice: "",
    stock: "10",
    media: createEmptyMedia(),
  });
  const [newProductCategoryMode, setNewProductCategoryMode] = useState<"existing" | "new">("existing");
  const [productEditor, setProductEditor] = useState<ProductEditorState | null>(null);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountPercent: "10",
    minSubtotal: "20000",
    usageLimit: "100",
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    recoveryEmail: "",
  });
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientNotification, setClientNotification] = useState({ title: "", message: "" });
  const changeHistory = db.changeHistory;
  const clientsByActivity = useMemo(
    () => [...db.clients].sort((a, b) => getActivityScore(b) - getActivityScore(a)),
    [db.clients],
  );

  const overviewSales = useMemo(() => db.sales.slice(-8), [db.sales]);
  const overviewSalesStats = useMemo(() => {
    const totalOrders = db.sales.reduce((sum, point) => sum + point.orders, 0);
    const totalRevenue = db.sales.reduce((sum, point) => sum + point.revenue, 0);
    const peakPoint = db.sales.reduce<AdminSalesPoint | null>((currentPeak, point) => {
      if (!currentPeak || point.orders > currentPeak.orders) {
        return point;
      }

      return currentPeak;
    }, null);

    return {
      totalOrders,
      totalRevenue,
      peakPoint,
    };
  }, [db.sales]);
  const overviewLineChart = useMemo(() => {
    const width = 860;
    const height = 240;
    const paddingX = 28;
    const paddingY = 24;
    const maxOrders = Math.max(...overviewSales.map((point) => point.orders), 1);
    const denominator = Math.max(overviewSales.length - 1, 1);

    const points = overviewSales.map((point, index) => {
      const x = paddingX + ((width - paddingX * 2) * index) / denominator;
      const y = height - paddingY - (Math.max(point.orders, 0) / maxOrders) * (height - paddingY * 2);
      return { x, y, period: point.period, orders: point.orders };
    });

    const path = points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
      .join(" ");

    const areaPath = points.length > 0
      ? `M${points[0].x.toFixed(2)},${(height - paddingY).toFixed(2)} ${points
          .map((point) => `L${point.x.toFixed(2)},${point.y.toFixed(2)}`)
          .join(" ")} L${points[points.length - 1].x.toFixed(2)},${(height - paddingY).toFixed(2)} Z`
      : "";

    const yTicks = Array.from(new Set([0, Math.round(maxOrders / 2), maxOrders])).sort((a, b) => a - b);

    return {
      width,
      height,
      paddingX,
      paddingY,
      maxOrders,
      points,
      path,
      areaPath,
      yTicks,
    };
  }, [overviewSales]);
  const promoByUsage = useMemo(
    () => [...db.promoCodes].sort((a, b) => b.usedCount - a.usedCount),
    [db.promoCodes],
  );


  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...categoryItems.flatMap((item) => [item.label, item.targetCategory].filter((value): value is string => Boolean(value))),
          ...db.products.map((product) => product.category),
        ]),
      ).sort((a, b) => a.localeCompare(b)),
    [db.products],
  );
  const selectedClient = useMemo(
    () => db.clients.find((client) => client.id === selectedClientId) ?? null,
    [db.clients, selectedClientId],
  );

  const selectedClientOrders = useMemo(
    () => db.orders.filter((order) => order.clientId === selectedClientId),
    [db.orders, selectedClientId],
  );

  const selectedProduct = useMemo(
    () => (productEditor ? db.products.find((product) => product.id === productEditor.productId) ?? null : null),
    [db.products, productEditor],
  );


  const allReviews = useMemo<AdminReviewItem[]>(() => {
    return db.clients
      .flatMap((client) =>
        client.reviews.map((review) => ({
          id: review.id,
          author: client.fullName,
          email: client.email,
          city: client.city,
          clientId: client.id,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
          photos: review.photos ?? [],
          createdAt: review.createdAt,
          status: review.status,
        })),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.clients]);

  const productAutoSaveSignatureRef = useRef("");
  const productUpdateRef = useRef(updateProduct);
  productUpdateRef.current = updateProduct;

  useEffect(() => {
    if (!productEditor || !selectedProduct || productEditor.productId !== selectedProduct.id) {
      productAutoSaveSignatureRef.current = "";
      return;
    }

    if (!hasProductChanges(productEditor, selectedProduct)) {
      productAutoSaveSignatureRef.current = "";
      return;
    }

    const signature = JSON.stringify(buildProductPatchFromEditor(productEditor, selectedProduct));
    if (productAutoSaveSignatureRef.current === signature) {
      return;
    }

    const timeout = window.setTimeout(() => {
      productAutoSaveSignatureRef.current = signature;
      productUpdateRef.current?.(selectedProduct.id, buildProductPatchFromEditor(productEditor, selectedProduct), true);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [productEditor, selectedProduct]);

  useEffect(() => {
    async function boot() {
      try {
        const sessionResponse = await fetch("/api/admin/session", {
          method: "GET",
          cache: "no-store",
        });

        const sessionPayload = (await sessionResponse.json()) as {
          authenticated?: boolean;
          databaseBacked?: boolean;
        };

        setDatabaseBacked(Boolean(sessionPayload.databaseBacked));

        if (!sessionPayload.authenticated) {
          setIsAuth(false);
          return;
        }

        setIsAuth(true);
        await loadDatabase();
      } catch {
        setIsAuth(false);
      } finally {
        setIsBooting(false);
      }
    }

    void boot();
  }, []);

  async function loadDatabase() {
    const response = await fetch("/api/admin/database", {
      method: "GET",
      cache: "no-store",
    });

    if (response.status === 401) {
      setIsAuth(false);
      return;
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      data?: AdminDatabase;
      databaseBacked?: boolean;
      message?: string;
    };

    if (!response.ok || !payload.data) {
      throw new Error(payload.message ?? "Impossible de charger les donnees admin.");
    }

    setDb(payload.data);
    setDatabaseBacked(Boolean(payload.databaseBacked));
    setSecurityForm((previous) => ({
      ...previous,
      recoveryEmail: payload.data?.settings.recoveryEmail ?? "",
    }));
  }

  async function persist(nextDb: AdminDatabase, message?: string) {
    setDb(nextDb);
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/database", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextDb),
      });

      if (response.status === 401) {
        setIsAuth(false);
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        data?: AdminDatabase;
        databaseBacked?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message ?? "Echec de sauvegarde.");
      }

      setDb(payload.data);
      setDatabaseBacked(Boolean(payload.databaseBacked));
      setSecurityForm((previous) => ({
        ...previous,
        recoveryEmail: payload.data?.settings.recoveryEmail ?? previous.recoveryEmail,
      }));

      if (message) {
        setFeedback(message);
      }
    } catch {
      setFeedback("Impossible de sauvegarder pour le moment.");
      await loadDatabase();
    } finally {
      setIsSaving(false);
    }
  }
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordInput,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setAuthError(payload.message ?? "Mot de passe invalide.");
        return;
      }

      setAuthError("");
      setFeedback(payload.message ?? "Connexion admin reussie.");
      setIsAuth(true);
      await loadDatabase();
    } catch {
      setAuthError("Connexion impossible pour le moment.");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
    } finally {
      setIsAuth(false);
      setPasswordInput("");
      setAuthError("");
    }
  }

  function createChangeHistoryItem(message: string) {
    return {
      id: `chg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      message,
      createdAt: new Date().toISOString(),
    };
  }
  function updateProduct(productId: string, update: Partial<Product>, quiet = false) {
    const current = db.products.find((product) => product.id === productId);
    const nextDb: AdminDatabase = {
      ...db,
      products: db.products.map((product) =>
        product.id === productId ? { ...product, ...update } : product,
      ),
    };

    if (current) {
      const updated = { ...current, ...update } as Product;
      const historyEntry = createChangeHistoryItem(summarizeProductChange(current, updated));
      nextDb.changeHistory = [historyEntry, ...db.changeHistory];

      if (productEditor?.productId === productId) {
        setProductEditor(createEmptyProductEditorState(updated));
      }
    }

    void persist(nextDb, quiet ? undefined : "Produit modifiÃ©.");
  }
  function removeProduct(productId: string) {
    const current = db.products.find((product) => product.id === productId);
    const nextDb: AdminDatabase = {
      ...db,
      products: db.products.filter((product) => product.id !== productId),
    };

    if (current) {
      nextDb.changeHistory = [createChangeHistoryItem(`Produit supprimÃ©: ${current.name}`), ...db.changeHistory];
    }

    if (productEditor?.productId === productId) {
      setProductEditor(null);
    }

    void persist(nextDb, "Produit supprimÃ©.");
  }
  function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newProduct.name.trim()) {
      setFeedback("Nom produit obligatoire.");
      return;
    }

    const price = Number(newProduct.price);
    const oldPrice = Number(newProduct.oldPrice);
    const stock = Number(newProduct.stock);

    if (!Number.isFinite(price) || price <= 0) {
      setFeedback("Prix invalide.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      setFeedback("Stock invalide.");
      return;
    }

    const resolvedCategory = newProductCategoryMode === "new"
      ? newProduct.newCategory.trim()
      : newProduct.category;

    if (!resolvedCategory) {
      setFeedback("Categorie obligatoire.");
      return;
    }

    const media = normalizeMediaItems(newProduct.media);
    if (media.length === 0) {
      setFeedback("Ajoute au moins un media du produit.");
      return;
    }

    const slug = slugify(newProduct.name);
    const id = `${slug}-${Date.now().toString(36)}`;
    const visual = makeVisual(newProduct.name);
    const primaryImage = media.find((item) => item.kind === "image")?.url ?? media[0]?.url;
    const images = mediaToLegacyImages(media);

    const product: Product = {
      id,
      slug,
      name: newProduct.name.trim(),
      description: newProduct.description.trim() || "Nouveau produit ajoutÃ© via admin.",
      details: [
        "Produit configure depuis le dashboard admin",
        "Livraison campus disponible",
        "Support client LIMAILLOTS",
      ],
      category: resolvedCategory,
      clubOrCountry: newProduct.clubOrCountry,
      price,
      oldPrice: Number.isFinite(oldPrice) && oldPrice > price ? oldPrice : undefined,
      popularity: 65,
      noveltyRank: Number(new Date().toISOString().slice(0, 10).replaceAll("-", "")),
      sizes: newProduct.sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      visual,
      media,
      imageUrl: primaryImage,
      images: images.length > 0 ? images : undefined,
      gradient: gradientPool[Math.floor(Math.random() * gradientPool.length)],
      stock,
      isNew: true,
    };

    const nextDb: AdminDatabase = {
      ...db,
      products: [product, ...db.products],
    };

    nextDb.changeHistory = [createChangeHistoryItem(`Produit ajoute: ${product.name}`), ...db.changeHistory];
    void persist(nextDb, "Nouveau produit ajoutÃ©.");
    setNewProduct({
      name: "",
      category: "Internationaux",
      newCategory: "",
      clubOrCountry: "Universel",
      description: "",
      sizes: "M,L,XL",
      price: "29990",
      oldPrice: "",
      stock: "10",
      media: createEmptyMedia(),
    });
    setNewProductCategoryMode("existing");
  }

  async function handleNewProductFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .slice(0, 6);

    if (files.length === 0) {
      event.target.value = "";
      return;
    }

    try {
      const media = await uploadFilesToBlob(files, "products");
      setNewProduct((previous) => ({
        ...previous,
        media: normalizeMediaItems([...previous.media, ...media]),
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Upload produit impossible.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleProductEditorFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .slice(0, 6);

    if (files.length === 0 || !productEditor) {
      event.target.value = "";
      return;
    }

    try {
      const media = await uploadFilesToBlob(files, "products");
      setProductEditor((previous) =>
        previous
          ? {
              ...previous,
              media: normalizeMediaItems([...previous.media, ...media]),
            }
          : previous,
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Upload produit impossible.");
    } finally {
      event.target.value = "";
    }
  }

  function togglePromoCode(promoId: string) {
    const nextDb: AdminDatabase = {
      ...db,
      promoCodes: db.promoCodes.map((promo) =>
        promo.id === promoId ? { ...promo, isActive: !promo.isActive } : promo,
      ),
    };

    void persist(nextDb, "Statut du code promo mis a jour.");
  }

  function updateReviewStatus(reviewId: string, status: ReviewStatus) {
    const nextDb: AdminDatabase = {
      ...db,
      clients: db.clients.map((client) => ({
        ...client,
        reviews: client.reviews.map((review) =>
          review.id === reviewId ? { ...review, status } : review,
        ),
      })),
    };

    const review = db.clients.flatMap((client) => client.reviews).find((item) => item.id === reviewId);
    if (review) {
      nextDb.changeHistory = [createChangeHistoryItem(`Avis ${status}: ${review.comment.slice(0, 40)}`), ...db.changeHistory];
    }

    void persist(nextDb, "Avis mis a jour.");
  }

  function updatePromoField(
    promoId: string,
    field: "code" | "discountPercent" | "minSubtotal" | "usageLimit",
    value: string,
  ) {
    const targetPromo = db.promoCodes.find((promo) => promo.id === promoId);
    if (!targetPromo) {
      return;
    }

    const nextPromos = db.promoCodes.map((promo) => {
      if (promo.id !== promoId) {
        return promo;
      }

      if (field === "code") {
        const nextCode = value.trim().toUpperCase();
        if (nextCode.length < 4) return promo;
        if (db.promoCodes.some((item) => item.id !== promoId && item.code === nextCode)) return promo;
        return { ...promo, code: nextCode };
      }

      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return promo;
      }

      if (field === "discountPercent") {
        return parsed > 0 && parsed <= 90 ? { ...promo, discountPercent: parsed } : promo;
      }

      if (field === "minSubtotal") {
        return parsed >= 0 ? { ...promo, minSubtotal: Math.floor(parsed) } : promo;
      }

      return parsed >= 1 ? { ...promo, usageLimit: Math.floor(parsed) } : promo;
    });

    const selectedPromo = nextPromos.find((promo) => promo.id === promoId);
    const nextMarquee = selectedPromo && db.marquee.promoCode === targetPromo.code
      ? {
          ...db.marquee,
          promoCode: selectedPromo.code,
          message: db.marquee.message.includes(targetPromo.code)
            ? buildMarqueeMessage(selectedPromo.code)
            : db.marquee.message,
        }
      : db.marquee;

    void persist({ ...db, promoCodes: nextPromos, marquee: nextMarquee });
  }

  function updateMarqueePromo(code: string) {
    const nextDb: AdminDatabase = {
      ...db,
      marquee: {
        promoCode: code,
        message: buildMarqueeMessage(code),
      },
      changeHistory: [createChangeHistoryItem(`Bandeau promo actif: ${code}`), ...db.changeHistory],
    };

    void persist(nextDb, "Bandeau promo mis a jour.");
  }

  function updateMarqueeMessage(message: string) {
    const nextDb: AdminDatabase = {
      ...db,
      marquee: {
        promoCode: db.marquee.promoCode,
        message,
      },
    };

    void persist(nextDb);
  }

  function handleAddPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = newPromo.code.trim().toUpperCase();
    if (code.length < 4) {
      setFeedback("Code promo trop court.");
      return;
    }

    if (db.promoCodes.some((promo) => promo.code === code)) {
      setFeedback("Ce code promo existe deja.");
      return;
    }

    const discountPercent = Number(newPromo.discountPercent);
    const minSubtotal = Number(newPromo.minSubtotal);
    const usageLimit = Number(newPromo.usageLimit);

    if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 90) {
      setFeedback("Pourcentage de reduction invalide.");
      return;
    }

    if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
      setFeedback("Minimum d'achat invalide.");
      return;
    }

    if (!Number.isFinite(usageLimit) || usageLimit < 1) {
      setFeedback("Limite d'utilisation invalide.");
      return;
    }

    const promo: AdminPromoCode = {
      id: `promo-${Date.now().toString(36)}`,
      code,
      discountPercent,
      minSubtotal,
      usageLimit,
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const nextPromoCodes = [promo, ...db.promoCodes];

    const nextDb: AdminDatabase = {
      ...db,
      promoCodes: nextPromoCodes,
      marquee: db.marquee.promoCode
        ? db.marquee
        : {
            promoCode: promo.code,
            message: buildMarqueeMessage(promo.code),
          },
      changeHistory: [createChangeHistoryItem(`Code promo cree: ${promo.code}`), ...db.changeHistory],
    };

    void persist(nextDb, "Nouveau code promo cree.");
    setNewPromo({
      code: "",
      discountPercent: "10",
      minSubtotal: "20000",
      usageLimit: "100",
    });
  }

  async function handleUpdateSecurity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/admin/security", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(securityForm),
      });

      if (response.status === 401) {
        setIsAuth(false);
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        settings?: AdminDatabase["settings"];
      };

      if (!response.ok || !payload.ok || !payload.settings) {
        setFeedback(payload.message ?? "Impossible de mettre a jour la securite.");
        return;
      }

      setDb((previous) => ({
        ...previous,
        settings: payload.settings ?? previous.settings,
      }));
      setFeedback(payload.message ?? "Securite admin mise a jour.");
      setSecurityForm((previous) => ({
        ...previous,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        recoveryEmail: payload.settings?.recoveryEmail ?? previous.recoveryEmail,
      }));
    } catch {
      setFeedback("Impossible de mettre a jour la securite pour le moment.");
    }
  }

  function sendClientNotification() {
    if (!selectedClientId) {
      setFeedback("Selectionne un client.");
      return;
    }

    if (!clientNotification.title.trim() || !clientNotification.message.trim()) {
      setFeedback("Titre et message obligatoires.");
      return;
    }

    const nextDb: AdminDatabase = {
      ...db,
      clients: db.clients.map((client) => {
        if (client.id !== selectedClientId) return client;

        return {
          ...client,
          notifications: [
            {
              id: `ntf-${Date.now().toString(36)}`,
              title: clientNotification.title.trim(),
              message: clientNotification.message.trim(),
              createdAt: new Date().toISOString().slice(0, 10),
              read: false,
            },
            ...client.notifications,
          ],
        };
      }),
    };

    nextDb.changeHistory = [createChangeHistoryItem(`Notification client envoyee a ${selectedClient?.fullName ?? "client"}`), ...db.changeHistory];
    setClientNotification({ title: "", message: "" });
    void persist(nextDb, "Notification client envoyee.");
  }

  async function resetSalesEvolution() {
    const confirmed = window.confirm(
      "Reinitialiser le graphique des commandes ? Les clients, commandes et produits restent intacts.",
    );

    if (!confirmed) {
      return;
    }

    const nextDb: AdminDatabase = {
      ...db,
      sales: [],
      changeHistory: [
        createChangeHistoryItem("Graphique des commandes reinitialise."),
        ...db.changeHistory,
      ],
    };

    void persist(nextDb, "Graphique des commandes reinitialise.");
  }

  async function resetClientsAndReviews() {
    const confirmed = window.confirm(
      "Reinitialiser completement la base clients et les avis ? Cette action efface aussi les commandes associees.",
    );

    if (!confirmed) {
      return;
    }

    setSelectedClientId("");

    const nextDb: AdminDatabase = {
      ...db,
      clients: [],
      orders: [],
      sales: [],
      changeHistory: [
        createChangeHistoryItem("Base clients/avis reinitialisee."),
        ...db.changeHistory,
      ],
    };

    void persist(nextDb, "Base clients et avis reinitialisee.");
  }

  async function deleteSelectedClient() {
    if (!selectedClient) {
      setFeedback("Selectionne un client.");
      return;
    }

    const confirmed = window.confirm(`Supprimer definitivement le compte ${selectedClient.fullName} ?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          email: selectedClient.email,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setFeedback(payload.message ?? "Suppression client impossible.");
        return;
      }

      setFeedback(payload.message ?? "Compte client supprime.");
      await loadDatabase();
    } catch {
      setFeedback("Suppression client impossible pour le moment.");
    }
  }

  async function reactivateSelectedClient() {
    if (!selectedClient) {
      setFeedback("Selectionne un client.");
      return;
    }

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reactivate",
          email: selectedClient.email,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setFeedback(payload.message ?? "RÃ©activation impossible.");
        return;
      }

      setFeedback(payload.message ?? "Compte client rÃ©activÃ©.");
      await loadDatabase();
    } catch {
      setFeedback("Reactivation client impossible pour le moment.");
    }
  }

  function setRecoveryEmail(value: string) {
    setSecurityForm((previous) => ({ ...previous, recoveryEmail: value }));
  }
  if (isBooting) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6">
        <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--card-shadow)]">
          <p className="text-sm text-[var(--text-muted)]">Chargement du dashboard admin...</p>
        </div>
      </main>
    );
  }

  if (!isAuth) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)]">
          <LimaillotsLogo className="h-12 w-[220px] text-[var(--text)]" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Connexion Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text)]">
            Tableau de bord LIMAILLOTS
          </h1>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              Mot de passe
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[var(--text)] outline-none"
                placeholder="LIMAILLOTS#2026"
              />
            </label>

            {authError ? <p className="text-sm text-red-500">{authError}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              Se connecter
            </button>
          </form>

          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Mot de passe initial: <strong>LIMAILLOTS#2026</strong>
          </p>
          <Link href="/" className="mt-3 inline-flex text-xs text-[var(--accent)]">
            Retour boutique
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <LimaillotsLogo className="h-12 w-[220px] text-[var(--text)]" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Administration boutique
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
            >
              Voir boutique
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
            >
              Deconnexion
            </button>
          </div>
        </header>

        {!databaseBacked ? (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-700">
            Mode sans DATABASE_URL detecte: les donnees ne sont pas encore persistees sur PostgreSQL.
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_1fr]">
          <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--card-shadow)]">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
            {feedback ? (
              <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm text-[var(--text-muted)]">
                {feedback}
              </div>
            ) : null}

            {isSaving ? (
              <div className="mb-4 text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Sauvegarde en cours...
              </div>
            ) : null}

            {activeTab === "overview" ? (
              <div className="space-y-6">
                <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 shadow-[var(--card-shadow)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Vue globale</p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">Evolution des commandes</h2>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Graphique reinitialisable des commandes de la boutique, mis a jour automatiquement.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetSalesEvolution}
                      className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
                    >
                      Reinitialiser le graphique
                    </button>
                  </div>

                  <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    {overviewSales.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                        Aucun historique de commandes pour le moment. Le graphique se remplira apres les prochaines ventes.
                      </div>
                    ) : (
                      <div className="relative">
                        <svg
                          viewBox={`0 0 ${overviewLineChart.width} ${overviewLineChart.height}`}
                          className="h-60 w-full"
                          role="img"
                          aria-label="Graphique en courbe des commandes"
                        >
                          {overviewLineChart.yTicks.map((tick) => {
                            const y = overviewLineChart.height - overviewLineChart.paddingY - (tick / overviewLineChart.maxOrders) * (overviewLineChart.height - overviewLineChart.paddingY * 2);

                            return (
                              <g key={`tick-${tick}`}>
                                <line
                                  x1={overviewLineChart.paddingX}
                                  y1={y}
                                  x2={overviewLineChart.width - overviewLineChart.paddingX}
                                  y2={y}
                                  stroke="var(--border)"
                                  strokeDasharray="4 6"
                                  strokeWidth="1"
                                />
                                <text
                                  x={overviewLineChart.paddingX - 8}
                                  y={y + 4}
                                  textAnchor="end"
                                  className="fill-[var(--text-muted)] text-[10px]"
                                >
                                  {tick}
                                </text>
                              </g>
                            );
                          })}

                          {overviewLineChart.areaPath ? (
                            <path d={overviewLineChart.areaPath} fill="url(#salesAreaGradient)" />
                          ) : null}

                          <defs>
                            <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>

                          <path
                            d={overviewLineChart.path}
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {overviewLineChart.points.map((point) => (
                            <g key={`point-${point.period}`}>
                              <circle cx={point.x} cy={point.y} r="4.5" fill="var(--accent)" />
                              <text x={point.x} y={overviewLineChart.height - 6} textAnchor="middle" className="fill-[var(--text-muted)] text-[10px] uppercase">
                                {point.period}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    )}
                  </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                  <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[var(--card-shadow)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Commandes totales</p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{overviewSalesStats.totalOrders}</p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">Depuis le debut de la periode suivie.</p>
                  </article>

                  <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[var(--card-shadow)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Chiffre d&apos;affaires</p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{formatPrice(overviewSalesStats.totalRevenue)}</p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">Total cumule sur le graphique.</p>
                  </article>

                  <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[var(--card-shadow)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Pic de ventes</p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--text)]">
                      {overviewSalesStats.peakPoint ? overviewSalesStats.peakPoint.period : "-"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      {overviewSalesStats.peakPoint ? `${overviewSalesStats.peakPoint.orders} commandes` : "Aucune vente enregistrÃ©e"}
                    </p>
                  </article>
                </section>
              </div>
            ) : null}

            {activeTab === "products" ? (
              <div className="space-y-8">
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[var(--card-shadow)]">
                    <h2 className="text-xl font-semibold text-[var(--text)]">Ajouter un produit</h2>
                    <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleAddProduct}>
                      <Input
                        label="Nom produit"
                        value={newProduct.name}
                        onChange={(value) => setNewProduct((prev) => ({ ...prev, name: value }))}
                      />
                      <label className="md:col-span-2 flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                        Categorie
                        <div className="mt-1 flex flex-wrap gap-2">
                          <select
                            value={newProductCategoryMode}
                            onChange={(event) => setNewProductCategoryMode(event.target.value as "existing" | "new")}
                            className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                          >
                            <option value="existing">Categorie existante</option>
                            <option value="new">Nouvelle categorie</option>
                          </select>

                          {newProductCategoryMode === "existing" ? (
                            <select
                              value={newProduct.category}
                              onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))}
                              className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                            >
                              {categoryOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              value={newProduct.newCategory}
                              onChange={(event) => setNewProduct((prev) => ({ ...prev, newCategory: event.target.value }))}
                              placeholder="Nouvelle categorie"
                              className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                            />
                          )}
                        </div>
                      </label>
                      <Input
                        label="Club/Pays"
                        value={newProduct.clubOrCountry}
                        onChange={(value) => setNewProduct((prev) => ({ ...prev, clubOrCountry: value }))}
                      />
                      <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                        Medias du produit
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleNewProductFilesChange}
                          className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                        />
                        <span className="text-xs text-[var(--text-muted)]">Jusqua 6 medias, enregistres directement en base.</span>
                      </label>
                      {newProduct.media.length > 0 ? (
                        <div className="md:col-span-2 grid grid-cols-3 gap-3">
                          {newProduct.media.map((item, index) => (
                            <div key={`${item.url}-${index}`} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                              {item.kind === "video" ? (
                                <video src={item.url} controls playsInline className="h-24 w-full object-cover" />
                              ) : (
                                <Image
                                  src={item.url}
                                  alt={`AperÃ§u mÃ©dia ${index + 1}`}
                                  width={180}
                                  height={180}
                                  unoptimized
                                  className="h-24 w-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <Input
                        label="Tailles"
                        value={newProduct.sizes}
                        onChange={(value) => setNewProduct((prev) => ({ ...prev, sizes: value }))}
                      />
                      <Input
                        label="Prix XOF"
                        value={newProduct.price}
                        onChange={(value) => setNewProduct((prev) => ({ ...prev, price: value }))}
                      />
                      <Input
                        label="Ancien prix XOF"
                        value={newProduct.oldPrice}
                        onChange={(value) => setNewProduct((prev) => ({ ...prev, oldPrice: value }))}
                      />
                      <Input
                        label="Stock"
                        value={newProduct.stock}
                        onChange={(value) => setNewProduct((prev) => ({ ...prev, stock: value }))}
                      />
                      <label className="md:col-span-2 flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                        Description
                        <textarea
                          value={newProduct.description}
                          onChange={(event) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                          className="min-h-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none"
                        />
                      </label>

                      <button
                        type="submit"
                        className="md:col-span-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                      >
                        Ajouter le produit
                      </button>
                    </form>
                  </section>

                  <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[var(--card-shadow)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          Edition produit
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
                          {selectedProduct ? selectedProduct.name : "Aucun produit choisi"}
                        </h2>
                      </div>
                      {selectedProduct ? (
                        <button
                          type="button"
                          onClick={() => setProductEditor(createEmptyProductEditorState(selectedProduct))}
                          className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
                        >
                          Recharger
                        </button>
                      ) : null}
                    </div>

                    {selectedProduct && productEditor ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            AperÃ§u rapide
                          </p>
                          <p className="mt-2 text-base font-semibold text-[var(--text)]">
                            {selectedProduct.category} - {selectedProduct.clubOrCountry}
                          </p>
                          <p className="mt-1">Prix actuel: {formatPrice(selectedProduct.price)}</p>
                          <p>Stock actuel: {selectedProduct.stock}</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            label="Nom"
                            value={productEditor.name}
                            onChange={(value) => setProductEditor((prev) => prev ? { ...prev, name: value } : prev)}
                          />
                          <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                            CatÃ©gorie
                            <div className="flex gap-2">
                              <select
                                value={productEditor.categoryMode}
                                onChange={(event) =>
                                  setProductEditor((prev) =>
                                    prev ? { ...prev, categoryMode: event.target.value as "existing" | "new" } : prev,
                                  )
                                }
                                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                              >
                                <option value="existing">Existante</option>
                                <option value="new">Nouvelle</option>
                              </select>
                              {productEditor.categoryMode === "existing" ? (
                                <select
                                  value={productEditor.category}
                                  onChange={(event) =>
                                    setProductEditor((prev) =>
                                      prev ? { ...prev, category: event.target.value } : prev,
                                    )
                                  }
                                  className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                                >
                                  {categoryOptions.map((category) => (
                                    <option key={category} value={category}>
                                      {category}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  value={productEditor.customCategory}
                                  onChange={(event) =>
                                    setProductEditor((prev) =>
                                      prev ? { ...prev, customCategory: event.target.value } : prev,
                                    )
                                  }
                                  placeholder="Nouvelle categorie"
                                  className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                                />
                              )}
                            </div>
                          </label>
                          <Input
                            label="Club/Pays"
                            value={productEditor.clubOrCountry}
                            onChange={(value) =>
                              setProductEditor((prev) => (prev ? { ...prev, clubOrCountry: value } : prev))
                            }
                          />
                          <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                            MÃ©dias du produit
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={handleProductEditorFilesChange}
                              className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                            />
                            <span className="text-xs text-[var(--text-muted)]">Les modifications sont enregistrÃ©es automatiquement.</span>
                          </label>
                          {productEditor.media.length > 0 ? (
                            <div className="md:col-span-2 grid grid-cols-3 gap-3">
                              {productEditor.media.map((item, index) => (
                                <div key={`${item.url}-${index}`} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                                  {item.kind === "video" ? (
                                    <video src={item.url} controls playsInline className="h-24 w-full object-cover" />
                                  ) : (
                                    <Image
                                      src={item.url}
                                      alt={`AperÃ§u mÃ©dia ${index + 1}`}
                                      width={180}
                                      height={180}
                                      unoptimized
                                      className="h-24 w-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          <Input
                            label="Tailles"
                            value={productEditor.sizes}
                            onChange={(value) =>
                              setProductEditor((prev) => (prev ? { ...prev, sizes: value } : prev))
                            }
                          />
                          <Input
                            label="Prix XOF"
                            value={productEditor.price}
                            onChange={(value) =>
                              setProductEditor((prev) => (prev ? { ...prev, price: value } : prev))
                            }
                          />
                          <Input
                            label="Ancien prix XOF"
                            value={productEditor.oldPrice}
                            onChange={(value) =>
                              setProductEditor((prev) => (prev ? { ...prev, oldPrice: value } : prev))
                            }
                          />
                          <Input
                            label="Stock"
                            value={productEditor.stock}
                            onChange={(value) =>
                              setProductEditor((prev) => (prev ? { ...prev, stock: value } : prev))
                            }
                          />
                          <Input
                            label="Visuel texte"
                            value={productEditor.visual}
                            onChange={(value) =>
                              setProductEditor((prev) => (prev ? { ...prev, visual: value } : prev))
                            }
                          />
                          <label className="md:col-span-2 flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                            Description
                            <textarea
                              value={productEditor.description}
                              onChange={(event) =>
                                setProductEditor((prev) =>
                                  prev ? { ...prev, description: event.target.value } : prev,
                                )
                              }
                              className="min-h-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            <input
                              type="checkbox"
                              checked={productEditor.isPromo}
                              onChange={() =>
                                setProductEditor((prev) => (prev ? { ...prev, isPromo: !prev.isPromo } : prev))
                              }
                            />
                            Promo
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            <input
                              type="checkbox"
                              checked={productEditor.isNew}
                              onChange={() =>
                                setProductEditor((prev) => (prev ? { ...prev, isNew: !prev.isNew } : prev))
                              }
                            />
                            Nouveau
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            Sauvegarde automatique active
                          </span>
                          <button
                            type="button"
                            onClick={() => setProductEditor(null)}
                            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-[var(--text-muted)]">
                        Clique sur &quot;Modifier&quot; sur un produit pour ouvrir le panneau d&apos;edition.
                      </p>
                    )}
                  </section>
                </div>

                <section>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Boutique actuelle</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {db.products.map((product) => (
                      <article
                        key={product.id}
                        className={`rounded-3xl border p-4 shadow-[var(--card-shadow)] transition ${
                          productEditor?.productId === product.id
                            ? "border-[var(--accent)] bg-[var(--surface)]"
                            : "border-[var(--border)] bg-[var(--surface-muted)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">{product.category}</p>
                            <h3 className="mt-1 text-lg font-semibold text-[var(--text)]">{product.name}</h3>
                            <p className="text-sm text-[var(--text-muted)]">{product.clubOrCountry}</p>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text)]">{formatPrice(product.price)}</p>
                        </div>
                        <div className="mt-4">
                          <ProductGallery product={product} compact showThumbnails={false} className="h-40 w-full" />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setProductEditor(createEmptyProductEditorState(product))}
                            className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="rounded-full border border-red-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-500"
                          >
                            Supprimer
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Historique modifications</h2>
                  <div className="mt-4 space-y-2">
                    {changeHistory.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">Aucune modification enregistrÃ©e.</p>
                    ) : null}
                    {changeHistory.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
                        <p className="font-semibold text-[var(--text)]">{item.message}</p>
                        <p className="text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
            {activeTab === "clients" ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-[var(--text)]">Base clients</h2>
                  <button
                    type="button"
                    onClick={() => void resetClientsAndReviews()}
                    className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-600"
                  >
                    Reinitialiser clients et avis
                  </button>
                </div>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)]">
                  <table className="min-w-[1180px] w-full text-left text-sm">
                    <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      <tr>
                        <th className="px-3 py-2">Client</th>
                        <th className="px-3 py-2">Ville</th>
                        <th className="px-3 py-2">Commandes</th>
                        <th className="px-3 py-2">Panier en cours</th>
                        <th className="px-3 py-2">Codes promo</th>
                        <th className="px-3 py-2">Favoris</th>
                        <th className="px-3 py-2">Avis</th>
                        <th className="px-3 py-2">Statut</th>
                        <th className="px-3 py-2">Depenses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsByActivity.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
                            Aucun client en base pour le moment.
                          </td>
                        </tr>
                      ) : null}
                      {clientsByActivity.map((client) => (
                        <tr
                          key={client.id}
                          className={`cursor-pointer border-t border-[var(--border)] ${selectedClientId === client.id ? "bg-[var(--surface-muted)]" : ""}`}
                          onClick={() => setSelectedClientId(client.id)}
                        >
                          <td className="px-3 py-2">
                            <p className="font-semibold text-[var(--text)]">{client.fullName}</p>
                            <p className="text-xs text-[var(--text-muted)]">{client.email}</p>
                          </td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">{client.city}</td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">{client.completedOrders}</td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">{client.pendingCarts}</td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">{client.promoCodesUsed.length}</td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">{client.favoriteProductIds.length}</td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">{client.reviews.length}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${client.deletedAt ? "border-amber-300 bg-amber-50 text-amber-700" : "border-emerald-300 bg-emerald-50 text-emerald-700"}`}>
                              {client.deletedAt ? (canReactivateClient(client) ? "SupprimÃ© - rÃ©activable" : "SupprimÃ© - bloquÃ©") : "Actif"}
                            </span>
                            {client.deletedAt ? (
                              <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                                {client.deletedReason ?? "Suppression admin."}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 font-semibold text-[var(--text)]">{formatPrice(client.totalSpent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedClient ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)]">
                      <h3 className="text-base font-semibold text-[var(--text)]">Inventaire client</h3>
                      <p className="mt-2">{selectedClient.fullName} - {selectedClient.email}</p>
                      <p>Statut: {selectedClient.deletedAt ? "Supprime" : "Actif"}</p>
                      {selectedClient.deletedAt ? (
                        <p>Suppression: {selectedClient.deletedReason ?? "Compte supprime par l'administrateur."}</p>
                      ) : null}
                      <p>Achats finalises: {selectedClient.completedOrders}</p>
                      <p>Panier en cours: {selectedClient.pendingCarts}</p>
                      <p>Codes promo: {selectedClient.promoCodesUsed.join(", ") || "Aucun"}</p>
                      <p>Favoris: {selectedClient.favoriteProductIds.join(", ") || "Aucun"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedClient.deletedAt ? (
                          <button
                            type="button"
                            onClick={() => void reactivateSelectedClient()}
                            className="rounded-full border border-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-600"
                          >
                            RÃ©activer le compte
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void deleteSelectedClient()}
                            className="rounded-full border border-red-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-500"
                          >
                            Supprimer le compte
                          </button>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]">Commandes</p>
                        {selectedClientOrders.length === 0 ? <p>Aucune commande.</p> : null}
                        {selectedClientOrders.map((order) => (
                          <div key={order.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
                            <p className="font-semibold text-[var(--text)]">{order.id}</p>
                            <p>{order.createdAt} - {formatPrice(order.total)} - {order.status}</p>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                      <h3 className="text-base font-semibold text-[var(--text)]">Envoyer notification</h3>
                      <div className="mt-3 space-y-3">
                        <Input
                          label="Titre"
                          value={clientNotification.title}
                          onChange={(value) => setClientNotification((prev) => ({ ...prev, title: value }))}
                        />
                        <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                          Message
                          <textarea
                            value={clientNotification.message}
                            onChange={(event) => setClientNotification((prev) => ({ ...prev, message: event.target.value }))}
                            className="min-h-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={sendClientNotification}
                          className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white"
                        >
                          Envoyer
                        </button>
                      </div>
                    </article>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Clique sur un client pour voir son inventaire complet.</p>
                )}
              </div>
            ) : null}


            {activeTab === "reviews" ? (
              <AdminReviewsPanel
                reviews={allReviews}
                onChangeStatus={updateReviewStatus}
              />
            ) : null}

            {activeTab === "promos" ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Creer un code promo</h2>
                  <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleAddPromo}>
                    <Input
                      label="Code"
                      value={newPromo.code}
                      onChange={(value) => setNewPromo((prev) => ({ ...prev, code: value }))}
                    />
                    <Input
                      label="Reduction %"
                      value={newPromo.discountPercent}
                      onChange={(value) =>
                        setNewPromo((prev) => ({ ...prev, discountPercent: value }))
                      }
                    />
                    <Input
                      label="Minimum XOF"
                      value={newPromo.minSubtotal}
                      onChange={(value) =>
                        setNewPromo((prev) => ({ ...prev, minSubtotal: value }))
                      }
                    />
                    <Input
                      label="Limite usages"
                      value={newPromo.usageLimit}
                      onChange={(value) =>
                        setNewPromo((prev) => ({ ...prev, usageLimit: value }))
                      }
                    />

                    <button
                      type="submit"
                      className="md:col-span-4 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                    >
                      Ajouter code promo
                    </button>
                  </form>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Codes promo actifs/inactifs</h2>
                  <div className="mt-4 space-y-3">
                    {db.promoCodes.map((promo) => (
                      <article
                        key={promo.id}
                        className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_auto_auto] md:items-center"
                      >
                        <Input
                          label="Code"
                          value={promo.code}
                          onChange={(value) => updatePromoField(promo.id, "code", value)}
                        />
                        <Input
                          label="Reduction %"
                          value={String(promo.discountPercent)}
                          onChange={(value) => updatePromoField(promo.id, "discountPercent", value)}
                        />
                        <Input
                          label="Minimum XOF"
                          value={String(promo.minSubtotal)}
                          onChange={(value) => updatePromoField(promo.id, "minSubtotal", value)}
                        />
                        <Input
                          label="Limite"
                          value={String(promo.usageLimit)}
                          onChange={(value) => updatePromoField(promo.id, "usageLimit", value)}
                        />
                        <button
                          type="button"
                          onClick={() => togglePromoCode(promo.id)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${
                            promo.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {promo.isActive ? "Actif" : "Inactif"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void persist(
                              {
                                ...db,
                                promoCodes: db.promoCodes.map((item) =>
                                  item.id === promo.id ? { ...item, usedCount: 0 } : item,
                                ),
                              },
                              "Compteur promo reinitialise.",
                            )
                          }
                          className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
                        >
                          Reset
                        </button>
                        <p className="md:col-span-6 text-xs text-[var(--text-muted)]">
                          Utilise {promo.usedCount} / {promo.usageLimit}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <h2 className="text-xl font-semibold text-[var(--text)]">Bandeau promo defilant</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                      Code a afficher
                      <select
                        value={db.marquee.promoCode}
                        onChange={(event) => updateMarqueePromo(event.target.value)}
                        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                      >
                        {db.promoCodes.map((promo) => (
                          <option key={promo.id} value={promo.code}>
                            {promo.code}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                      Message du bandeau
                      <input
                        value={db.marquee.message}
                        onChange={(event) => updateMarqueeMessage(event.target.value)}
                        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
                      />
                    </label>
                  </div>
                  <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                    {db.marquee.message}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Codes les plus utilises</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {promoByUsage.slice(0, 3).map((promo) => (
                      <article
                        key={promo.id}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                      >
                        <p className="text-sm font-semibold text-[var(--text)]">{promo.code}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{promo.usedCount} utilisations</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Historique modifications</h2>
                  <div className="mt-4 space-y-2">
                    {changeHistory.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">Aucune modification enregistrÃ©e.</p>
                    ) : null}
                    {changeHistory.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
                        <p className="font-semibold text-[var(--text)]">{item.message}</p>
                        <p className="text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            {activeTab === "security" ? (
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Securite admin</h2>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Compte admin: {db.settings.adminEmail || "admin@limaillots.shop"}
                </p>
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleUpdateSecurity}>
                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(value) =>
                      setSecurityForm((prev) => ({ ...prev, currentPassword: value }))
                    }
                  />
                  <Input
                    label="Adresse email recuperation"
                    value={securityForm.recoveryEmail}
                    onChange={setRecoveryEmail}
                  />
                  <Input
                    label="Nouveau mot de passe"
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(value) =>
                      setSecurityForm((prev) => ({ ...prev, newPassword: value }))
                    }
                  />
                  <Input
                    label="Confirmation"
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(value) =>
                      setSecurityForm((prev) => ({ ...prev, confirmPassword: value }))
                    }
                  />

                  <button
                    type="submit"
                    className="md:col-span-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Mettre a jour la securite
                  </button>
                </form>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--text)] outline-none"
      />
    </label>
  );
}

function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || `produit-${Date.now().toString(36)}`;
}

function makeVisual(name: string): string {
  const letters = name
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("");

  return letters || "NEW";
}

function buildMarqueeMessage(code: string): string {
  return `10% OFF POUR TOUTES COMMANDES AVEC LE CODE PROMO "${code}"`;
}

function getActivityScore(client: AdminClient): number {
  return (
    client.totalSpent +
    client.completedOrders * 10000 +
    client.reviews.length * 6000 +
    client.favoriteProductIds.length * 1500
  );
}



































function canReactivateClient(client: AdminClient): boolean {
  if (!client.deletedAt) {
    return false;
  }

  const deletedAt = new Date(client.deletedAt);
  if (Number.isNaN(deletedAt.getTime())) {
    return false;
  }

  const diffDays = (Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}



















