"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const { items, ready, itemCount, subtotal, removeItem, updateQuantity, clearCart } =
    useCart();

  if (!ready) {
    return (
      <main className="min-h-screen bg-chestnut text-maple">
        <div className="h-16" />
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-4xl font-semibold">Your Cart</h1>
          <p className="mt-4 text-maple/80">Loading cart...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-chestnut text-maple">
      <div className="h-16" />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Your Cart</h1>
          </div>

          {items.length ? (
            <button
              type="button"
              onClick={clearCart}
              className="rounded-full border border-maple/40 px-5 py-2 font-medium transition hover:bg-maple hover:text-chestnut"
            >
              Clear Cart
            </button>
          ) : null}
        </div>

        {!items.length ? (
          <div className="mt-12 rounded-3xl bg-driftwood p-10 text-center text-walnut">
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-3 text-walnut/80">
              Add a few products and they will show up here.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-background px-8 py-3 font-semibold text-sandstone transition hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-3xl bg-driftwood p-5 text-walnut sm:grid-cols-[120px_1fr]"
                >
                  <div className="relative h-32 overflow-hidden rounded-2xl">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="120px"
                      loading="eager"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link
                        href={`/products/${item.id}`}
                        className="text-xl font-semibold hover:underline"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 text-walnut/80">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center overflow-hidden rounded-full border border-walnut/20">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-4 py-2 text-lg font-semibold transition hover:bg-walnut/10"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>

                        <span className="min-w-12 px-4 py-2 text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-4 py-2 text-lg font-semibold transition hover:bg-walnut/10"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-full border border-walnut/20 px-4 py-2 font-medium transition hover:bg-walnut hover:text-sandstone"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-start-2">
                    <p className="text-lg font-semibold">
                      Item total: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-3xl bg-driftwood p-6 text-walnut">
              <h2 className="text-2xl font-semibold">Cart Summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span className="font-semibold">{itemCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>Entered at checkout</span>
                </div>

                <div className="flex items-center justify-between border-t border-walnut/15 pt-4 text-lg font-semibold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-8 block w-full rounded-full bg-background px-8 py-3 text-center font-semibold text-sandstone transition hover:opacity-90"
              >
                Continue to Checkout
              </Link>

              <Link
                href="/shop"
                className="mt-4 block rounded-full border border-walnut/20 px-8 py-3 text-center font-semibold transition hover:bg-walnut hover:text-sandstone"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}