import { supabaseServer } from "@/lib/supabaseServer";
import type { ProductRow } from "./types";

export async function loadProducts(): Promise<{
  products: ProductRow[];
  error?: string;
}> {
  const extended = await supabaseServer
    .from("products")
    .select(
      "id, name, description, price, image_url, created_at, in_stock, on_sale, product_images(id, image_url, sort_order, is_primary, created_at, variant)",
    )
    .order("created_at", { ascending: false });

  if (!extended.error) {
    return { products: (extended.data ?? []) as ProductRow[] };
  }

  const basic = await supabaseServer
    .from("products")
    .select(
      "id, name, description, price, image_url, created_at, product_images(id, image_url, sort_order, is_primary, created_at, variant)",
    )
    .order("created_at", { ascending: false });

  if (basic.error) {
    return { products: [], error: basic.error.message };
  }

  return { products: (basic.data ?? []) as ProductRow[] };
}