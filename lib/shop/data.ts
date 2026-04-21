import type { Product } from "@/types/product";
import { mockProducts } from "@/lib/mockProducts";
import { supabaseServer } from "@/lib/supabaseServer";
import type { StorefrontProduct } from "./types";
import { getFeaturedRank, getProductCategory } from "./filters";

type ProductRowBase = {
  id: string;
  name: string;
  price: number | string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  let data: Array<ProductRowBase & { in_stock?: boolean; on_sale?: boolean }> =
    [];
  let hasExtendedColumns = true;

  const extended = await supabaseServer
    .from("products")
    .select("id, name, price, description, image_url, created_at, in_stock, on_sale")
    .order("created_at", { ascending: false });

  if (extended.error) {
    hasExtendedColumns = false;
  } else {
    data = (extended.data ?? []) as typeof data;
  }

  if (!hasExtendedColumns) {
    const basic = await supabaseServer
      .from("products")
      .select("id, name, price, description, image_url, created_at")
      .order("created_at", { ascending: false });

    if (basic.error || !basic.data?.length) {
      return mockProducts.map((product, index) => ({
        ...product,
        createdAt: new Date(Date.now() - index * 60_000).toISOString(),
        featuredRank: getFeaturedRank(product.name),
        category: getProductCategory(product.name),
        inStock: true,
        onSale: false,
      }));
    }

    data = (basic.data ?? []) as typeof data;
  }

  if (!data.length) {
    return mockProducts.map((product, index) => ({
      ...product,
      createdAt: new Date(Date.now() - index * 60_000).toISOString(),
      featuredRank: getFeaturedRank(product.name),
      category: getProductCategory(product.name),
      inStock: true,
      onSale: false,
    }));
  }

  const products = data
    .filter((product) => product.image_url)
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image: product.image_url ?? "",
      description: product.description?.trim() || "No description available.",
      createdAt: product.created_at,
      featuredRank: getFeaturedRank(product.name),
      category: getProductCategory(product.name),
      inStock: typeof product.in_stock === "boolean" ? product.in_stock : true,
      onSale: typeof product.on_sale === "boolean" ? product.on_sale : false,
    })) satisfies StorefrontProduct[];

  return products.length
    ? products
    : mockProducts.map((product: Product, index: number) => ({
        ...product,
        createdAt: new Date(Date.now() - index * 60_000).toISOString(),
        featuredRank: getFeaturedRank(product.name),
        category: getProductCategory(product.name),
        inStock: true,
        onSale: false,
      }));
}