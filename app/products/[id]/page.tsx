import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedProducts from "@/app/components/FeaturedProducts";
import ProductImageGallery from "@/app/components/ProductImageGallery";
import AddToCartButton from "@/app/components/AddToCartButton";
import { getProductPageModel } from "@/lib/products.server";

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ wood?: string }>;
};

export default async function ProductDetails({
  params,
  searchParams,
}: ProductPageProps) {
  const { id } = await params;
  const { wood } = await searchParams;

  const model = await getProductPageModel({ id, wood });

  if (!model) {
    notFound();
  }

  const {
    product,
    relatedProducts,
    variantConfig,
    secondaryVariantConfig, // add
    activeUrls,
    activePrimaryImage,
  } = model;

  return (
    <main className="min-h-screen bg-sandstone text-background">
      <div className="h-16" />

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/shop"
            className="text-sm uppercase tracking-[0.2em] text-background/60 hover:text-background transition"
          >
            Back to Shop
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <ProductImageGallery
            name={product.name}
            images={activeUrls.length ? activeUrls : product.images}
          />

          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.3em] text-background/60">
              Product Details
            </p>

            <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight">
              {product.name}
            </h1>

            {product.price > 0 ? (
              <p className="text-chestnut mt-3 font-medium">
                ${product.price.toFixed(2)}
              </p>
            ) : (
              <p className="text-chestnut mt-3 font-medium">
                Price coming soon
              </p>
            )}

            <div className="mt-8 space-y-4 text-lg leading-8 text-background/80">
              <p>{product.description}</p>
            </div>

            <div className="mt-10">
              <AddToCartButton
                id={product.id}
                name={product.name}
                price={product.price}
                image={activePrimaryImage}
                variantLabel={variantConfig?.label}
                variantOptions={variantConfig?.options}
                secondaryVariantLabel={secondaryVariantConfig?.label} // add
                secondaryVariantOptions={secondaryVariantConfig?.options} // add
              />
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts
        products={relatedProducts}
        title="You May Also Like"
        limit={6}
        showDescription={false}
      />
    </main>
  );
}
