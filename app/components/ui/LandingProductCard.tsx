"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { getLandingHeroProduct } from "@/lib/products";

type LandingProductCardProps = {
  products: Product[];
};

export default function LandingProductCard({
  products,
}: LandingProductCardProps) {
  if (!products.length) {
    return null;
  }

  const product = getLandingHeroProduct(products);

  if (!product) {
    return null;
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="w-64 rounded-xl bg-sandstone p-6 shadow transition hover:scale-[1.02]"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="256px"
          loading="eager"
          className="object-cover"
        />
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-walnut/60">
        Featured Product
      </p>

      <h3 className="mt-2 text-xl font-semibold text-walnut">
        {product.name}
      </h3>

      <p className="mt-3 font-medium text-walnut">${product.price}</p>
    </Link>
  );
}