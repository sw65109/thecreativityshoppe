import Image from "next/image";
import Link from "next/link";
import type { StorefrontProduct } from "@/lib/shop";

type ShopProductGridProps = {
  products: StorefrontProduct[];
};

export function ShopProductGrid({ products }: ShopProductGridProps) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-3">
      {products.length ? (
        products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="group">
            <div className="bg-sandstone rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative w-full h-96">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  loading="eager"
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-walnut group-hover:text-foreground transition">
                  {product.name}
                </h3>

                <p className="text-chestnut mt-3 font-medium">${product.price}</p>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full rounded-xl border border-maple/40 bg-driftwood p-8 text-center text-walnut">
          <h2 className="text-2xl font-semibold">No matching products</h2>
          <p className="mt-3 text-walnut/80">
            Try a different search term or browse the full shop.
          </p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-block rounded-full bg-background px-6 py-3 font-semibold text-sandstone transition hover:opacity-90"
            >
              View All Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}