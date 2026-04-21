"use client";

import Image from "next/image";
import Link from "next/link";
import LandingProductCard from "./ui/LandingProductCard";
import type { Product } from "@/types/product";

export default function Landing({ products }: { products: Product[] }) {
  return (
    <div className="bg-[url('/textures/red_wood_grain.jpg')] bg-cover bg-top bg-no-repeat">
    <section className="text-sandstone">
      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">

        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
          Creating Functional Art
        </h1>

        <Link href="/shop">
          <button className="rounded-full bg-sandstone px-6 py-3 font-semibold text-background transition hover:opacity-90">
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
            className="rounded-full bg-sandstone object-contain"
          />

          <div className="flex flex-col items-center gap-4 text-center">
            <LandingProductCard products={products} />
            <p className="pt-4 text-3xl font-semibold md:text-4xl">
              We believe in Quality Craftsmanship
            </p>
          </div>
        </div>

        <div className="mt-48 mb-48 w-full max-w-3xl">
          <Image
            src="/booth.jpg"
            alt="The Creativity Shoppe booth"
            width={1600}
            height={900}
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 768px, 768px"
            priority
            className="h-auto w-full object-cover rounded-lg"
          />
        </div>

      </div>
    </section>
    </div>
  );
}