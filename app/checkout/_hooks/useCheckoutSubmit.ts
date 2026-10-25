"use client";

import { useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { CartItem } from "@/app/context/CartContext";
import type { CheckoutOrderForm } from "@/lib/checkoutForm";
import { buildCheckoutPayload } from "@/lib/checkoutPayload";

type UseCheckoutSubmitArgs = {
  items: CartItem[];
  form: CheckoutOrderForm;
  user: User | null;
  validate: () => string | null;
  clearCart: () => void;
  resetGuestForm: () => void;
  tokenizeCard: () => Promise<string>;
};

type SquareCheckoutSuccess = {
  ok: true;
  orderId: string;
  orderNumber: number;
  total: number;
  paymentId: string | null;
  receiptUrl: string | null;
  paymentPending?: boolean;
};

type SquareCheckoutError = { error: string };

export function useCheckoutSubmit({
  items,
  form,
  user,
  validate,
  clearCart,
  resetGuestForm,
  tokenizeCard,
}: UseCheckoutSubmitArgs) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const attemptIdRef = useRef<string | null>(null);

  async function handleCheckout() {
    if (inFlightRef.current) return;

    const validationError = validate();

    if (validationError) {
      setCheckoutMessage(null);
      return;
    }

    if (!items.length) {
      setCheckoutMessage("Your cart is empty.");
      return;
    }

    inFlightRef.current = true;
    attemptIdRef.current ??= crypto.randomUUID();
    setIsCheckingOut(true);
    setCheckoutMessage(null);

    try {
      const sourceId = await tokenizeCard();

      const response = await fetch("/api/checkout/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          checkoutAttemptId: attemptIdRef.current,
          checkout: buildCheckoutPayload(items, form),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | SquareCheckoutSuccess
        | SquareCheckoutError
        | null;

      if (!response.ok) {
        const errorMessage =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof (payload as Record<string, unknown>).error === "string"
            ? ((payload as Record<string, unknown>).error as string)
            : "Payment failed. Please try again.";

        throw new Error(errorMessage);
      }

      if (!payload || !("ok" in payload) || payload.ok !== true) {
        throw new Error("Payment failed. Please try again.");
      }

      attemptIdRef.current = null;
      clearCart();

      if (!user) {
        resetGuestForm();
      }

      setCheckoutMessage(
        payload.paymentPending
          ? `Payment received, confirming order. Order #${payload.orderNumber}`
          : `Payment successful. Order #${payload.orderNumber}`,
      );
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error ? error.message : "Failed to place order.",
      );
    } finally {
      inFlightRef.current = false;
      setIsCheckingOut(false);
    }
  }

  return {
    isCheckingOut,
    checkoutMessage,
    handleCheckout,
  };
}