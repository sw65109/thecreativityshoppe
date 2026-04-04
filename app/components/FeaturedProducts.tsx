import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type FeaturedProductsProps = {
  products: Product[];
  title?: string;
  limit?: number;
  excludeProductId?: string;
  showDescription?: boolean;
};

export default function FeaturedProducts({
  products,
  title = "Featured Products",
  limit = 6,
  excludeProductId,
  showDescription = true,
}: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  const visibleProducts = products
    .filter((product) => product.id !== excludeProductId)
    .slice(0, limit);

  if (!visibleProducts.length) return null;

  return (
    <div className="w-full bg-[url('/textures/wood_grain.jpg')] bg-cover bg-center bg-no-repeat ">
      <section className="w-full py-24">
        <h2 className="text-3xl font-semibold text-center text-sandstone mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {visibleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-sandstone p-6 rounded-xl shadow hover:scale-[1.02] transition"
            >
              <div className="relative w-full h-72 overflow-hidden rounded-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  loading="eager"
                  sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-semibold mt-4 text-walnut">
                {product.name}
              </h3>

              {showDescription ? (
                <p className="mt-2 text-sm text-walnut/80 line-clamp-3">
                  {product.description}
                </p>
              ) : null}

              <p className="text-walnut font-medium mt-3">${product.price}</p>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/shop">
            <button className="px-8 py-2 border border-sandstone text-walnut bg-sandstone text-shadow-lg font-semibold rounded-full cursor-pointer hover:bg-background hover:text-sandstone transition">
              View Products
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
