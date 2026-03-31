import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedProducts from "@/app/components/FeaturedProducts";
import ProductImageGallery from "@/app/components/ProductImageGallery";
import AddToCartButton from "@/app/components/AddToCartButton";
import { mockProducts } from "@/lib/mockProducts";
import { supabaseServer } from "@/lib/supabaseServer";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ wood?: string }>;
};

type ProductImageRow = {
  id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  variant: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  product_images: ProductImageRow[] | null;
};

type StorefrontProduct = Product & {
  images: string[];
  imageRows: ProductImageRow[];
};

function normalizeVariant(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function coerceToOption(value: unknown, options: string[]) {
  const target = normalizeVariant(value);
  if (!target) return null;

  for (const option of options) {
    if (normalizeVariant(option) === target) return option;
  }

  return null;
}

function getVariantConfig(
  productName: string,
): { label: string; options: string[] } | null {
  const name = productName.toLowerCase();

  if (name.includes("crochet") && name.includes("hook")) {
    return { label: "Wood", options: ["Walnut", "Maple", "Cherry"] };
  }

  if (
    name.includes("short") &&
    name.includes("french") &&
    name.includes("rolling")
  ) {
    return { label: "Wood", options: ["Maple", "Black Walnut", "Cherry"] };
  }
  if (name.includes("french") && name.includes("rolling")) {
    return { label: "Wood", options: ["Maple", "Black Walnut", "Cherry"] };
  }

  if (name.includes("pen")) {
    return {
      label: "Wood",
      options: ["Purple Heart", "Honey Locust", "Hickory", "Padauk"],
    };
  }

  return null;
}

async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(
      "id, name, price, description, image_url, created_at, product_images(id, image_url, sort_order, is_primary, created_at, variant)",
    )
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return mockProducts.map((product) => ({
      ...product,
      images: [product.image],
      imageRows: [],
    }));
  }

  const products = (data as ProductRow[]).map((product) => {
    const sortedGallery =
      product.product_images?.slice().sort((left, right) => {
        if (left.is_primary && !right.is_primary) return -1;
        if (!left.is_primary && right.is_primary) return 1;
        return left.sort_order - right.sort_order;
      }) ?? [];

    const imageRows = sortedGallery.filter((row) => Boolean(row.image_url));

    const galleryUrls = imageRows.map((image) => image.image_url).filter(Boolean);

    const primaryImage = galleryUrls[0] ?? product.image_url ?? "";
    const allImages = Array.from(
      new Set([primaryImage, ...galleryUrls].filter(Boolean)),
    );

    return {
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image: primaryImage,
      description: product.description?.trim() || "No description available.",
      images: allImages.length ? allImages : [primaryImage].filter(Boolean),
      imageRows,
    };
  });

  const validProducts = products.filter(
    (product) => product.image && product.images.length > 0,
  );

  return validProducts.length
    ? validProducts
    : mockProducts.map((product) => ({
        ...product,
        images: [product.image],
        imageRows: [],
      }));
}

export default async function ProductDetails({ params, searchParams }: ProductPageProps) {
  const { id } = await params;
  const { wood } = await searchParams;

  const products = await getStorefrontProducts();
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((item) => item.id !== product.id);
  const variantConfig = getVariantConfig(product.name);

  const selectedVariant =
    variantConfig?.options?.length
      ? coerceToOption(wood, variantConfig.options) ?? variantConfig.options[0] ?? ""
      : "";

  const selectedVariantKey = normalizeVariant(selectedVariant);

  const variantMatchedRows =
    selectedVariantKey && product.imageRows.length
      ? product.imageRows.filter(
          (row) => normalizeVariant(row.variant) === selectedVariantKey,
        )
      : [];

  const defaultRows =
    product.imageRows.length
      ? product.imageRows.filter((row) => !normalizeVariant(row.variant))
      : [];

  const activeRows =
    variantMatchedRows.length
      ? variantMatchedRows
      : defaultRows.length
        ? defaultRows
        : product.imageRows;

  const activeUrls = Array.from(
    new Set(activeRows.map((row) => row.image_url).filter(Boolean)),
  );

  const activePrimaryImage = activeUrls[0] ?? product.image;

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

            <p className="mt-6 text-3xl font-medium text-walnut">
              ${product.price.toFixed(2)}
            </p>

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