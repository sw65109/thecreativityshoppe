"use client";

export function CheckoutLoading() {
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