"use client";

import Link from "next/link";

type CheckoutOrderSummaryProps = {
  subtotal: number;
};

export function CheckoutOrderSummary({ subtotal }: CheckoutOrderSummaryProps) {
  return (
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
  );
}