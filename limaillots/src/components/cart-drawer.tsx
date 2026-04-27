<<<<<<< HEAD
﻿import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { formatPrice } from "@/lib/store-utils";
import { Product } from "@/types/store";

interface CartProduct {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  items: CartProduct[];
  totalItems: number;
  totalPrice: number;
  onClose: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export function CartDrawer({
  open,
  items,
  totalItems,
  totalPrice,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
}: CartDrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl transition duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Panier"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Panier
            </p>
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              {totalItems} article{totalItems > 1 ? "s" : ""}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)]"
            aria-label="Fermer le panier"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-10rem)] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
                Ton panier est vide.
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                >
                  <div className="flex gap-3">
                    <div
                      className={`h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl bg-gradient-to-br ${product.gradient} p-3 text-center text-2xl text-white`}
                    >
                      {product.visual}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text)]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
                          <button
                            type="button"
                            onClick={() => onDecrement(product.id)}
                            className="p-2 text-[var(--text)]"
                            aria-label="Diminuer la quantité"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-[var(--text)]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onIncrement(product.id)}
                            className="p-2 text-[var(--text)]"
                            aria-label="Augmenter la quantité"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemove(product.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-red-500"
                          aria-label="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
              <span>Sous-total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={items.length === 0}
            >
              Valider la commande
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

=======
﻿import { FormEvent, useState } from "react";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { formatPrice } from "@/lib/store-utils";
import { Product } from "@/types/store";

interface CartProduct {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  items: CartProduct[];
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedPromoCode: string;
  promoMessage: string;
  isApplyingPromo: boolean;
  onClose: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onApplyPromo: (code: string) => Promise<void>;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  totalItems,
  totalPrice,
  discountAmount,
  finalPrice,
  appliedPromoCode,
  promoMessage,
  isApplyingPromo,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onApplyPromo,
  onCheckout,
}: CartDrawerProps) {
  const [promoInput, setPromoInput] = useState("");

  async function handlePromoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!promoInput.trim()) return;
    await onApplyPromo(promoInput);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl transition duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Panier"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Panier
            </p>
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              {totalItems} article{totalItems > 1 ? "s" : ""}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)]"
            aria-label="Fermer le panier"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-10rem)] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
                Ton panier est vide.
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3"
                >
                  <div className="flex gap-3">
                    <div
                      className={`h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl bg-gradient-to-br ${product.gradient} p-3 text-center text-2xl text-white`}
                    >
                      {product.visual}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text)]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
                          <button
                            type="button"
                            onClick={() => onDecrement(product.id)}
                            className="p-2 text-[var(--text)]"
                            aria-label="Diminuer la quantité"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-[var(--text)]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onIncrement(product.id)}
                            className="p-2 text-[var(--text)]"
                            aria-label="Augmenter la quantité"
                            disabled={quantity >= product.stock}
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemove(product.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-red-500"
                          aria-label="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <form className="space-y-2" onSubmit={handlePromoSubmit}>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Code promo
              </label>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value)}
                  placeholder="LIMAILL0T5"
                  className="h-10 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none"
                />
                <button
                  type="submit"
                  disabled={isApplyingPromo || items.length === 0}
                  className="rounded-full border border-[var(--border)] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApplyingPromo ? "..." : "Appliquer"}
                </button>
              </div>
              {promoMessage ? (
                <p className="text-xs text-[var(--text-muted)]">{promoMessage}</p>
              ) : null}
            </form>

            <div className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
              <div className="flex items-center justify-between">
                <span>Sous-total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Réduction {appliedPromoCode ? `(${appliedPromoCode})` : ""}</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-[var(--text)]">
                <span>Total</span>
                <span>{formatPrice(finalPrice)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCheckout}
              className="mt-4 w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={items.length === 0}
            >
              Valider la commande
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
