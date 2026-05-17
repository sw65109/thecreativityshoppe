"use client";

import Link from "next/link";
import { formatCurrency, toMoneyNumber } from "@/lib/money";

type CheckoutOrderSummaryProps = {
  subtotal: number;
  promoCode?: string;
};

export function CheckoutOrderSummary({
  subtotal,
  promoCode,
}: CheckoutOrderSummaryProps) {
  const TAX_RATE = 0.0885;

  const normalizedPromoCode = promoCode?.trim().toUpperCase() ?? "";

  const discountTotal =
    normalizedPromoCode === "2026" && subtotal >= 50
      ? toMoneyNumber(subtotal * 0.1)
      : 0;

  const discountedSubtotal = toMoneyNumber(subtotal - discountTotal);
  const taxTotal = toMoneyNumber(discountedSubtotal * TAX_RATE);

  const total = toMoneyNumber(discountedSubtotal + taxTotal);

  return (
    <div className="rounded-3xl bg-driftwood p-6 text-walnut">
      <h2 className="text-2xl font-semibold">Order Summary</h2>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>

        {discountTotal > 0 ? (
          <div className="flex items-center justify-between">
            <span>Discount ({normalizedPromoCode})</span>
            <span className="font-semibold">
              -{formatCurrency(discountTotal)}
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <span>Tax (8.85%)</span>
          <span className="font-semibold">{formatCurrency(taxTotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>Based on address</span>
        </div>

        <div className="flex items-center justify-between border-t border-walnut/15 pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Link
        href="/cart"
        className="mt-6 block rounded-full border border-walnut/20 px-8 py-3 text-center font-semibold transition hover:bg-walnut hover:text-sandstone"
      >
        Back to Cart
      </Link>
    </div>
  );
}