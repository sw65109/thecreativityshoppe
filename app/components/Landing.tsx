"use client";

import Image from "next/image";
import Link from "next/link";
import LandingProductCard from "./ui/LandingProductCard";
import type { Product } from "@/types/product";

export default function Landing({ products }: { products: Product[] }) {
  return (
    <section className="bg-sandstone text-background">
      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
          Creating Functional Art
        </h1>

        <Link href="/shop">
          <button className="rounded-full bg-background px-6 py-3 font-semibold text-sandstone transition hover:opacity-90">
            Shop now
          </button>
        </Link>

        <div className="mt-16 flex w-full max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-center">
          <Image
            src="/the_creativity_shoppe1.png"
            alt="Tree Logo"
            width={440}
            height={440}
            loading="eager"
            className="rounded-full bg-driftwood object-contain"
          />

          <div className="flex flex-col items-center gap-4 text-center">
            <LandingProductCard products={products} />
            <p className="pt-4 text-3xl font-semibold md:text-4xl">
              We believe in Quality Craftsmanship
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}