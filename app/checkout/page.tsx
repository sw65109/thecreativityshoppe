"use client";

import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import CheckoutForm from "@/app/components/checkout/CheckoutForm";
import { useCheckoutForm } from "@/app/hooks/useCheckoutForm";
import { CheckoutEmptyCart } from "./_components/CheckoutEmptyCart";
import { CheckoutLoading } from "./_components/CheckoutLoading";
import { CheckoutOrderSummary } from "./_components/CheckoutOrderSummary";
import { CheckoutItems } from "./_components/CheckoutItems";
import { useCheckoutSubmit } from "./_hooks/useCheckoutSubmit";

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

  const { isCheckingOut, checkoutMessage, handleCheckout } = useCheckoutSubmit({
    items,
    form,
    user,
    validate,
    clearCart,
    resetGuestForm,
  });

  if (!ready || !initialized || loading || isLoadingCheckoutData) {
    return <CheckoutLoading />;
  }

  if (!items.length) {
    return <CheckoutEmptyCart />;
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
              onSubmit={handleCheckout}
            />

            {checkoutMessage ? (
              <div className="mt-4 rounded-2xl border border-maple/20 bg-driftwood px-4 py-3 text-sm text-walnut">
                {checkoutMessage}
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <CheckoutOrderSummary subtotal={subtotal} />
            <CheckoutItems items={items} />
          </aside>
        </div>
      </section>
    </main>
  );
}