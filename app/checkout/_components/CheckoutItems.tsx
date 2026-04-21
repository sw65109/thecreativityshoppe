"use client";

import Image from "next/image";
import type { CartItem } from "@/app/context/CartContext";

type CheckoutItemsProps = {
  items: CartItem[];
};

export function CheckoutItems({ items }: CheckoutItemsProps) {
  return (
    <div className="rounded-3xl bg-driftwood p-6 text-walnut">
      <h2 className="text-2xl font-semibold">Items</h2>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.id}::${item.variant ?? ""}`}
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
              {item.variant ? (
                <p className="text-sm text-walnut/70">{item.variant}</p>
              ) : null}
              <p className="text-sm text-walnut/70">Qty {item.quantity}</p>
            </div>

            <p className="font-semibold">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}