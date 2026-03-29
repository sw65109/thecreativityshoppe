"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

type AddToCartButtonProps = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function AddToCartButton({
  id,
  name,
  price,
  image,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem({
      id,
      name,
      price,
      image,
      quantity: 1,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        onClick={handleAddToCart}
        className="rounded-full bg-background px-8 py-3 font-semibold text-sandstone transition hover:opacity-90"
      >
        {added ? "Added to Cart" : "Add to Cart"}
      </button>

      <Link
        href="/cart"
        className="rounded-full border border-background/20 px-8 py-3 font-semibold text-background transition hover:bg-background hover:text-sandstone"
      >
        View Cart
      </Link>
    </div>
  );
}