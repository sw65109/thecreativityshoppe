"use client";

import Link from "next/link";

export function CheckoutEmptyCart() {
  return (
    <main className="min-h-screen bg-chestnut text-maple">
      <div className="h-16" />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-maple/60">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Checkout</h1>

        <div className="mt-10 rounded-3xl bg-driftwood p-10 text-center text-walnut">
          <h2 className="text-2xl font-semibold">There is nothing to check out</h2>
          <p className="mt-3 text-walnut/80">
            Add products to your cart first, then come back here to enter shipping
            and billing details.
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