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

type CraftShowRow = {
  id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
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

async function getUpcomingCraftShows(): Promise<CraftShowRow[]> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabaseServer
    .from("craft_shows")
    .select("id, name, location, start_date, end_date")
    .eq("is_active", true)
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .order("sort_order", { ascending: true })

  if (error) return [];
  return (data ?? []) as CraftShowRow[];
}

export default async function Home() {
  const [products, craftShows] = await Promise.all([
    getStorefrontProducts(),
    getUpcomingCraftShows(),
  ]);

  return (
    <div>
      <Landing products={products} craftShows={craftShows} />
      <FeaturedProducts products={products} />
    </div>
  );
}