"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import CheckoutForm from "@/app/components/checkout/CheckoutForm";
import { useCheckoutForm } from "@/app/hooks/useCheckoutForm";
import { createOrderFromCart } from "@/lib/orderClient";
import { buildCheckoutPayload } from "@/lib/checkoutPayload";

export default function CheckoutPage() {
  const { items, ready, subtotal, clearCart } = useCart();
  const { user, initialized, loading } = useAuth();
  const {
    form,
    savedAddresses,
    selectedShippingAddressId,
    selectedBillingAddressId,
    isLoadingCheckoutData,
    validationMessage,
    updateTopLevelField,
    updateShippingField,
    updateBillingField,
    selectShippingAddress,
    selectBillingAddress,
    validate,
    resetGuestForm,
  } = useCheckoutForm({
    user,
    initialized,
    loading,
  });

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  async function handleCheckout() {
    const validationError = validate();

    if (validationError) {
      setCheckoutMessage(null);
      return;
    }

    if (!items.length) {
      setCheckoutMessage("Your cart is empty.");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutMessage(null);

    try {
      const result = await createOrderFromCart(
        buildCheckoutPayload(items, form),
      );

      clearCart();

      if (!user) {
        resetGuestForm();
      }

      setCheckoutMessage(
        `Order placed successfully. Order #${result.orderNumber}`,
      );
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error ? error.message : "Failed to place order.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (!ready || !initialized || loading || isLoadingCheckoutData) {
    return (
      <main className="min-h-screen bg-chestnut text-maple flex flex-col items-center">
        <div className="h-16" />
        <section className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-maple/60">
            Checkout
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Checkout</h1>
          <p className="mt-4 text-maple/80">Loading checkout...</p>
        </section>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="min-h-screen bg-chestnut text-maple">
        <div className="h-16" />
        <section className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-maple/60">
            Checkout
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Checkout</h1>

          <div className="mt-10 rounded-3xl bg-driftwood p-10 text-center text-walnut">
            <h2 className="text-2xl font-semibold">
              There is nothing to check out
            </h2>
            <p className="mt-3 text-walnut/80">
              Add products to your cart first, then come back here to enter
              shipping and billing details.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="rounded-full bg-background px-8 py-3 font-semibold text-sandstone transition hover:opacity-90"
              >
                Continue Shopping
              </Link>

              <Link
                href="/cart"
                className="rounded-full border border-walnut/20 px-8 py-3 font-semibold transition hover:bg-walnut hover:text-sandstone"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-chestnut text-maple">
      <div className="h-16" />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-maple/60">
            Checkout
          </p>
          <h1 className="text-4xl font-semibold">Customer Details</h1>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <CheckoutForm
              user={user}
              form={form}
              savedAddresses={savedAddresses}
              selectedShippingAddressId={selectedShippingAddressId}
              selectedBillingAddressId={selectedBillingAddressId}
              validationMessage={validationMessage}
              isCheckingOut={isCheckingOut}
              onTopLevelChange={updateTopLevelField}
              onShippingChange={updateShippingField}
              onBillingChange={updateBillingField}
              onSelectShippingAddress={selectShippingAddress}
              onSelectBillingAddress={selectBillingAddress}
              onSubmit={() => void handleCheckout()}
            />

            {checkoutMessage ? (
              <div className="mt-4 rounded-2xl border border-maple/20 bg-driftwood px-4 py-3 text-sm text-walnut">
                {checkoutMessage}
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-driftwood p-6 text-walnut">
              <h2 className="text-2xl font-semibold">Order Summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>Based on address</span>
                </div>

                <div className="flex items-center justify-between border-t border-walnut/15 pt-4 text-lg font-semibold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/cart"
                className="mt-6 block rounded-full border border-walnut/20 px-8 py-3 text-center font-semibold transition hover:bg-walnut hover:text-sandstone"
              >
                Back to Cart
              </Link>
            </div>

            <div className="rounded-3xl bg-driftwood p-6 text-walnut">
              <h2 className="text-2xl font-semibold">Items</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-2xl border border-walnut/15 bg-sandstone/55 p-3"
                  >
                    <div className="relative h-18 overflow-hidden rounded-xl">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="72px"
                        loading="eager"
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-walnut/70">
                        Qty {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
