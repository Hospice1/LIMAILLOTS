
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LimaillotsLogo } from "@/components/limaillots-logo";
import { AdminReviewsPanel, type AdminReviewItem } from "@/components/admin/admin-reviews-panel";
import { formatPrice } from "@/lib/store-utils";
import { AdminClient, AdminDatabase, AdminPromoCode, ReviewStatus } from "@/types/admin";
import { Product } from "@/types/store";

type AdminTab = "overview" | "products" | "clients" | "reviews" | "promos" | "security";

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
  sales: [],
  orders: [],
  settings: {
    adminEmail: "",
    recoveryEmail: "",
    updatedAt: new Date().toISOString(),
  },
};

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

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Internationaux",
    newCategory: "",
    clubOrCountry: "Universel",
    description: "",
    sizes: "M,L,XL",
    price: "29990",
    stock: "10",
    imageUrl: "",
  });
  const [newProductCategoryMode, setNewProductCategoryMode] = useState<"existing" | "new">("existing");

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
  const [changeHistory, setChangeHistory] = useState<Array<{ id: string; message: string; createdAt: string }>>([]);

  const totals = useMemo(() => {
    const totalRevenue = db.sales.reduce((sum, item) => sum + item.revenue, 0);
    const completedOrders = db.clients.reduce(
      (sum, client) => sum + client.completedOrders,
      0,
    );
    const pendingCarts = db.clients.reduce(
      (sum, client) => sum + client.pendingCarts,
      0,
    );

    return {
      totalRevenue,
      completedOrders,
      pendingCarts,
      totalClients: db.clients.length,
    };
  }, [db.clients, db.sales]);

  const clientsByActivity = useMemo(
    () => [...db.clients].sort((a, b) => getActivityScore(b) - getActivityScore(a)),
    [db.clients],
  );

  const promoByUsage = useMemo(
    () => [...db.promoCodes].sort((a, b) => b.usedCount - a.usedCount),
    [db.promoCodes],
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(db.products.map((product) => product.category))).sort((a, b) => a.localeCompare(b)),
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
          createdAt: review.createdAt,
          status: review.status,
        })),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.clients]);

  const maxRevenue = useMemo(
    () => Math.max(...db.sales.map((item) => item.revenue), 1),
    [db.sales],
  );

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

  function addChangeHistory(message: string) {
    setChangeHistory((previous) => [
      {
        id: `chg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        message,
        createdAt: new Date().toISOString(),
      },
      ...previous,
    ]);
  }

  function updateProduct(productId: string, update: Partial<Product>) {
    const current = db.products.find((product) => product.id === productId);
    const nextDb: AdminDatabase = {
      ...db,
      products: db.products.map((product) =>
        product.id === productId ? { ...product, ...update } : product,
      ),
    };

    if (current) {
      addChangeHistory(`Produit modifie: ${current.name}`);
    }

    void persist(nextDb, "Produit modifie.");
  }

  function removeProduct(productId: string) {
    const current = db.products.find((product) => product.id === productId);
    const nextDb: AdminDatabase = {
      ...db,
      products: db.products.filter((product) => product.id !== productId),
    };

    if (current) {
      addChangeHistory(`Produit supprime: ${current.name}`);
    }

    void persist(nextDb, "Produit supprime.");
  }

  function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newProduct.name.trim()) {
      setFeedback("Nom produit obligatoire.");
      return;
    }

    const price = Number(newProduct.price);
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

    const slug = slugify(newProduct.name);
    const id = `${slug}-${Date.now().toString(36)}`;
    const visual = makeVisual(newProduct.name);

    const product: Product = {
      id,
      slug,
      name: newProduct.name.trim(),
      description: newProduct.description.trim() || "Nouveau produit ajoute via admin.",
      details: [
        "Produit configure depuis le dashboard admin",
        "Livraison campus disponible",
        "Support client LIMAILLOTS",
      ],
      category: resolvedCategory,
      clubOrCountry: newProduct.clubOrCountry,
      price,
      rating: 4.4,
      popularity: 65,
      noveltyRank: Number(new Date().toISOString().slice(0, 10).replaceAll("-", "")),
      sizes: newProduct.sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      visual,
      imageUrl: newProduct.imageUrl.trim() || undefined,
      gradient: gradientPool[Math.floor(Math.random() * gradientPool.length)],
      stock,
      isNew: true,
    };

    const nextDb: AdminDatabase = {
      ...db,
      products: [product, ...db.products],
    };

    addChangeHistory(`Produit ajoute: ${product.name}`);
    void persist(nextDb, "Nouveau produit ajoute.");
    setNewProduct({
      name: "",
      category: "Internationaux",
      newCategory: "",
      clubOrCountry: "Universel",
      description: "",
      sizes: "M,L,XL",
      price: "29990",
      stock: "10",
      imageUrl: "",
    });
    setNewProductCategoryMode("existing");
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
      addChangeHistory(`Avis ${status}: ${review.comment.slice(0, 40)}`);
    }

    void persist(nextDb, "Avis mis a jour.");
  }

  function updatePromoUsageLimit(promoId: string, value: string) {
    const usageLimit = Number(value);
    if (!Number.isFinite(usageLimit) || usageLimit < 1) {
      return;
    }

    const nextDb: AdminDatabase = {
      ...db,
      promoCodes: db.promoCodes.map((promo) =>
        promo.id === promoId ? { ...promo, usageLimit } : promo,
      ),
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

    const nextDb: AdminDatabase = {
      ...db,
      promoCodes: [promo, ...db.promoCodes],
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

  function resetOverviewData() {
    const nextDb: AdminDatabase = {
      ...db,
      sales: [],
      orders: [],
      promoCodes: db.promoCodes.map((promo) => ({ ...promo, usedCount: 0 })),
    };

    void persist(nextDb, "Vue globale reinitialisee (hors clients actifs).");
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

    setClientNotification({ title: "", message: "" });
    void persist(nextDb, "Notification client envoyee.");
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
              <div className="space-y-8">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={resetOverviewData}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
                  >
                    Reinitialiser cette vue (hors clients)
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Chiffre d'affaires" value={formatPrice(totals.totalRevenue)} />
                  <StatCard label="Commandes finalisees" value={totals.completedOrders.toString()} />
                  <StatCard label="Paniers en cours" value={totals.pendingCarts.toString()} />
                  <StatCard label="Clients" value={totals.totalClients.toString()} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">
                    Evolution des ventes
                  </h2>
                  <div className="mt-4 flex items-end gap-3 overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    {db.sales.map((item) => {
                      const height = Math.max(24, Math.round((item.revenue / maxRevenue) * 180));

                      return (
                        <div key={item.period} className="flex min-w-16 flex-col items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            {item.orders} cmd
                          </span>
                          <div
                            className="w-10 rounded-t-xl bg-gradient-to-t from-[var(--accent)] to-cyan-400"
                            style={{ height }}
                          />
                          <span className="text-xs font-semibold text-[var(--text)]">
                            {item.period}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">
                    Clients les plus actifs
                  </h2>
                  <div className="mt-4 space-y-3">
                    {clientsByActivity.slice(0, 5).map((client) => (
                      <article
                        key={client.id}
                        className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">
                            {client.fullName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">{client.email}</p>
                        </div>
                        <div className="text-right text-xs text-[var(--text-muted)]">
                          <p>{client.completedOrders} commandes</p>
                          <p>{formatPrice(client.totalSpent)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Historique modifications</h2>
                  <div className="mt-4 space-y-2">
                    {changeHistory.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">Aucune modification enregistree.</p>
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

            {activeTab === "products" ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Ajouter un produit</h2>
                  <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleAddProduct}>
                    <Input
                      label="Nom produit"
                      value={newProduct.name}
                      onChange={(value) => setNewProduct((prev) => ({ ...prev, name: value }))}
                    />
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
                      Categorie
                      <div className="flex gap-2">
                        <select
                          value={newProductCategoryMode}
                          onChange={(event) =>
                            setNewProductCategoryMode(event.target.value as "existing" | "new")
                          }
                          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--text)]"
                        >
                          <option value="existing">Existante</option>
                          <option value="new">Nouvelle</option>
                        </select>
                        {newProductCategoryMode === "existing" ? (
                          <select
                            value={newProduct.category}
                            onChange={(event) =>
                              setNewProduct((prev) => ({ ...prev, category: event.target.value }))
                            }
                            className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--text)]"
                          >
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={newProduct.newCategory}
                            onChange={(event) =>
                              setNewProduct((prev) => ({ ...prev, newCategory: event.target.value }))
                            }
                            placeholder="Nouvelle categorie"
                            className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--text)]"
                          />
                        )}
                      </div>
                    </label>
                    <Input
                      label="Club/Pays"
                      value={newProduct.clubOrCountry}
                      onChange={(value) =>
                        setNewProduct((prev) => ({ ...prev, clubOrCountry: value }))
                      }
                    />
                    <Input
                      label="Image URL"
                      value={newProduct.imageUrl}
                      onChange={(value) => setNewProduct((prev) => ({ ...prev, imageUrl: value }))}
                    />
                    <Input
                      label="Tailles (S,M,L)"
                      value={newProduct.sizes}
                      onChange={(value) => setNewProduct((prev) => ({ ...prev, sizes: value }))}
                    />
                    <Input
                      label="Prix XOF"
                      value={newProduct.price}
                      onChange={(value) => setNewProduct((prev) => ({ ...prev, price: value }))}
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
                        className="min-h-24 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text)] outline-none"
                      />
                    </label>

                    <button
                      type="submit"
                      className="md:col-span-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                    >
                      Ajouter le produit
                    </button>
                  </form>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Gerer la boutique</h2>
                  <div className="mt-4 space-y-3">
                    {db.products.map((product) => (
                      <article
                        key={product.id}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                      >
                        <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,1fr)_auto] md:items-end">
                          <Input
                            label="Nom"
                            value={product.name}
                            onChange={(value) => updateProduct(product.id, { name: value })}
                          />
                          <Input
                            label="Prix"
                            value={String(product.price)}
                            onChange={(value) => {
                              const num = Number(value);
                              if (Number.isFinite(num) && num > 0) {
                                updateProduct(product.id, { price: num });
                              }
                            }}
                          />
                          <Input
                            label="Stock"
                            value={String(product.stock)}
                            onChange={(value) => {
                              const num = Number(value);
                              if (Number.isFinite(num) && num >= 0) {
                                updateProduct(product.id, { stock: num });
                              }
                            }}
                          />
                          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            <input
                              type="checkbox"
                              checked={Boolean(product.isPromo)}
                              onChange={() =>
                                updateProduct(product.id, { isPromo: !product.isPromo })
                              }
                            />
                            Promo
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            <input
                              type="checkbox"
                              checked={Boolean(product.isNew)}
                              onChange={() =>
                                updateProduct(product.id, { isNew: !product.isNew })
                              }
                            />
                            Nouveau
                          </label>
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
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Historique modifications</h2>
                  <div className="mt-4 space-y-2">
                    {changeHistory.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">Aucune modification enregistree.</p>
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

            {activeTab === "clients" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Base clients</h2>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)]">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      <tr>
                        <th className="px-3 py-2">Client</th>
                        <th className="px-3 py-2">Ville</th>
                        <th className="px-3 py-2">Commandes</th>
                        <th className="px-3 py-2">Panier en cours</th>
                        <th className="px-3 py-2">Codes promo</th>
                        <th className="px-3 py-2">Favoris</th>
                        <th className="px-3 py-2">Avis</th>
                        <th className="px-3 py-2">Depenses</th>
                      </tr>
                    </thead>
                    <tbody>
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
                      <p>Achats finalises: {selectedClient.completedOrders}</p>
                      <p>Panier en cours: {selectedClient.pendingCarts}</p>
                      <p>Codes promo: {selectedClient.promoCodesUsed.join(", ") || "Aucun"}</p>
                      <p>Favoris: {selectedClient.favoriteProductIds.join(", ") || "Aucun"}</p>

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
                        className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto_auto] md:items-center"
                      >
                        <div>
                          <p className="font-semibold text-[var(--text)]">{promo.code}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Utilise {promo.usedCount} / {promo.usageLimit}
                          </p>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">-{promo.discountPercent}%</p>
                        <p className="text-sm text-[var(--text-muted)]">Min {formatPrice(promo.minSubtotal)}</p>
                        <Input
                          label="Limite"
                          value={String(promo.usageLimit)}
                          onChange={(value) => updatePromoUsageLimit(promo.id, value)}
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
                      </article>
                    ))}
                  </div>
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
                      <p className="text-sm text-[var(--text-muted)]">Aucune modification enregistree.</p>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{value}</p>
    </article>
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

function getActivityScore(client: AdminClient): number {
  return (
    client.totalSpent +
    client.completedOrders * 10000 +
    client.reviews.length * 6000 +
    client.favoriteProductIds.length * 1500
  );
}












