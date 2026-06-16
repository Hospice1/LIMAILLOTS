import { FormEvent, useMemo, useState } from "react";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { SiteLanguage, getSiteCopy } from "@/lib/i18n";
import { formatPrice } from "@/lib/store-utils";
import { CheckoutCustomer, Product } from "@/types/store";

interface CartProduct {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  language: SiteLanguage;
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
  onCheckout: (customer: CheckoutCustomer) => Promise<void>;
}

export function CartDrawer({
  open,
  language,
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
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [wantsDelivery, setWantsDelivery] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const copy = useMemo(() => getSiteCopy(language), [language]);

  async function handlePromoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!promoInput.trim()) return;
    await onApplyPromo(promoInput);
  }

  async function handleCheckoutSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = checkoutEmail.trim().toLowerCase();
    const phone = checkoutPhone.trim();
    const address = deliveryAddress.trim();

    if (!email || !email.includes("@")) {
      setCheckoutError("Ajoute une adresse email valide.");
      return;
    }

    if (!phone) {
      setCheckoutError("Ajoute ton numero de telephone.");
      return;
    }

    if (wantsDelivery && !address) {
      setCheckoutError("Ajoute ton adresse de livraison ou desactive la livraison.");
      return;
    }

    setCheckoutError("");
    setIsCheckingOut(true);
    try {
      await onCheckout({
        email,
        phone,
        wantsDelivery,
        deliveryAddress: wantsDelivery ? address : "",
      });
    } finally {
      setIsCheckingOut(false);
    }
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
        aria-label={copy.cart.label}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {copy.cart.label}
            </p>
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              {totalItems} {copy.cart.article}{totalItems > 1 ? "s" : ""}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)]"
            aria-label={copy.cart.closeAria}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-10rem)] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
                {copy.cart.empty}
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
                      <p className="font-price mt-1 text-xs text-[var(--text-muted)]">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
                          <button
                            type="button"
                            onClick={() => onDecrement(product.id)}
                            className="p-2 text-[var(--text)]"
                            aria-label="Decrease quantity"
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
                            aria-label="Increase quantity"
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
                {copy.cart.promo}
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
                  {isApplyingPromo ? "..." : copy.cart.apply}
                </button>
              </div>
              {promoMessage ? (
                <p className="text-xs text-[var(--text-muted)]">{promoMessage}</p>
              ) : null}
            </form>

            <div className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
              <div className="flex items-center justify-between">
                <span>{copy.cart.subtotal}</span>
                <span className="font-price">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.cart.discount} {appliedPromoCode ? `(${appliedPromoCode})` : ""}</span>
                <span className="font-price">-{formatPrice(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-[var(--text)]">
                <span>{copy.cart.total}</span>
                <span className="font-price">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleCheckoutSubmit}>
              <div className="grid gap-2">
                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(event) => setCheckoutEmail(event.target.value)}
                  placeholder="Email pour la commande"
                  className="h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none"
                />
                <input
                  value={checkoutPhone}
                  onChange={(event) => setCheckoutPhone(event.target.value)}
                  placeholder="Numero de telephone"
                  className="h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none"
                />
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    checked={wantsDelivery}
                    onChange={() => setWantsDelivery((current) => !current)}
                  />
                  Je veux etre livre
                </label>
                {wantsDelivery ? (
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Adresse de livraison"
                    className="min-h-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none"
                  />
                ) : null}
              </div>

              {checkoutError ? <p className="text-xs text-red-500">{checkoutError}</p> : null}

              <button
                type="submit"
                className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={items.length === 0 || isCheckingOut}
              >
                {isCheckingOut ? "Preparation..." : "Commander sur WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
