"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LimaillotsLogo } from "@/components/limaillots-logo";
import { logoutClient } from "@/lib/client-account";
import { readCartFromStorage } from "@/lib/client-storage";
import { formatPrice } from "@/lib/store-utils";
import { AdminClient, AdminOrder } from "@/types/admin";

interface AccountPayload {
  ok?: boolean;
  message?: string;
  user?: {
    email?: string;
    fullName?: string;
  };
  client?: AdminClient | null;
  orders?: AdminOrder[];
}

export function ClientAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("Client");
  const [client, setClient] = useState<AdminClient | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingCartItems = useMemo(() => readCartFromStorage(), []);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/client/account", { cache: "no-store" });

        if (response.status === 401) {
          router.replace("/compte/connexion");
          return;
        }

        const payload = (await response.json()) as AccountPayload;

        if (!response.ok || !payload.ok) {
          router.replace("/compte/connexion");
          return;
        }

        setEmail(payload.user?.email ?? "");
        setDisplayName(payload.user?.fullName ?? "Client LIMAILLOTS");
        setClient(payload.client ?? null);
        setOrders(Array.isArray(payload.orders) ? payload.orders : []);
      } catch {
        router.replace("/compte/connexion");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [router]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6">
        <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--card-shadow)]">
          <p className="text-sm text-[var(--text-muted)]">Chargement de votre espace client...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <LimaillotsLogo className="h-11 w-[210px] text-[var(--text)]" />
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Espace client
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
          >
            Retour boutique
          </Link>
          <button
            type="button"
            onClick={() => {
              void logoutClient().finally(() => router.push("/"));
            }}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)]"
          >
            Deconnexion
          </button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Card title="Profil" value={displayName} subtitle={client?.email || email || "-"} />
        <Card
          title="Commandes"
          value={String(orders.length)}
          subtitle="Historique des achats"
        />
        <Card
          title="Panier"
          value={client?.pendingCarts ? "En cours" : "Finalise"}
          subtitle={`${pendingCartItems.length} article(s) localement`}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Commandes effectuees</h2>
          <div className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Aucune commande enregistree.</p>
            ) : null}
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
              >
                <p className="font-semibold text-[var(--text)]">{order.id}</p>
                <p className="text-[var(--text-muted)]">
                  {order.createdAt} - {formatPrice(order.total)}
                </p>
                <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  {order.status}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Notifications admin</h2>
          <div className="mt-4 space-y-3">
            {!client || client.notifications.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Aucune notification pour le moment.
              </p>
            ) : null}
            {client?.notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
              >
                <p className="font-semibold text-[var(--text)]">{notification.title}</p>
                <p className="text-[var(--text-muted)]">{notification.message}</p>
                <p className="text-xs text-[var(--text-muted)]">{notification.createdAt}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)]">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">{title}</p>
      <p className="mt-2 text-xl font-semibold text-[var(--text)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
    </article>
  );
}
