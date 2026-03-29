import Landing from "./components/Landing";
import FeaturedProducts from "./components/FeaturedProducts";
import { mockProducts } from "@/lib/mockProducts";
import { supabaseServer } from "@/lib/supabaseServer";
import type { Product } from "@/types/product";

type ProductRow = {
  id: string;
  name: string;
  price: number | string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

async function getStorefrontProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("id, name, price, description, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return mockProducts;
  }

  const products = (data as ProductRow[])
    .filter((product) => product.image_url)
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image: product.image_url ?? "",
      description: product.description?.trim() || "No description available.",
    }));

  return products.length ? products : mockProducts;
}

export default async function Home() {
  const products = await getStorefrontProducts();

  return (
    <div>
      <Landing products={products} />
      <FeaturedProducts products={products} />
    </div>
  );
}