"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { CartItem } from "@/app/context/CartContext";
import type { CheckoutOrderForm } from "@/lib/checkoutForm";
import { createOrderFromCart } from "@/lib/orderClient";
import { buildCheckoutPayload } from "@/lib/checkoutPayload";

type UseCheckoutSubmitArgs = {
  items: CartItem[];
  form: CheckoutOrderForm;
  user: User | null;
  validate: () => string | null;
  clearCart: () => void;
  resetGuestForm: () => void;
};

export function useCheckoutSubmit({
  items,
  form,
  user,
  validate,
  clearCart,
  resetGuestForm,
}: UseCheckoutSubmitArgs) {
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
      const result = await createOrderFromCart(buildCheckoutPayload(items, form));

      clearCart();

      if (!user) {
        resetGuestForm();
      }

      setCheckoutMessage(`Order placed successfully. Order #${result.orderNumber}`);
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error ? error.message : "Failed to place order.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  return {
    isCheckingOut,
    checkoutMessage,
    handleCheckout,
  };
}