import { supabase } from "@/lib/supabaseClient";
import type { CartItem } from "./types";
import { normalizeVariant } from "./variant";

type ProductJoin = {
  id: string;
  name: string;
  price: number | string | null;
  image_url: string | null;
};

type CartItemRow = {
  product_id: string;
  variant: string | null;
  quantity: number;
  products: ProductJoin | ProductJoin[] | null;
};

export async function fetchServerCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, variant, quantity, products(id, name, price, image_url)")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load server cart:", error);
    return [];
  }

  const rows = (data ?? []) as unknown as CartItemRow[];

  return rows
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      if (!product) return null;

      const variant = normalizeVariant(row.variant);

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price ?? 0),
        image: product.image_url ?? "/the_creativity_shoppe1.png",
        quantity: Math.max(1, Number(row.quantity ?? 1)),
        variant: variant || undefined,
      } satisfies CartItem;
    })
    .filter(Boolean) as CartItem[];
}

export async function mergeGuestCartIntoServer(userId: string, guestItems: CartItem[]) {
  if (!guestItems.length) return;

  const { data: existing, error: existingError } = await supabase
    .from("cart_items")
    .select("product_id, variant, quantity")
    .eq("user_id", userId);

  if (existingError) {
    console.error("Failed to read existing server cart:", existingError);
    return;
  }

  const existingMap = new Map<string, number>();
  for (const row of (existing ?? []) as Array<{ product_id: string; variant: string | null; quantity: number }>) {
    const key = `${row.product_id}::${normalizeVariant(row.variant)}`;
    existingMap.set(key, Number(row.quantity ?? 0));
  }

  const upsertRows = guestItems.map((item) => {
    const variant = normalizeVariant(item.variant);
    const key = `${item.id}::${variant}`;
    const currentQty = existingMap.get(key) ?? 0;
    const nextQty = Math.max(1, currentQty + Math.max(1, item.quantity));

    return {
      user_id: userId,
      product_id: item.id,
      variant,
      quantity: nextQty,
    };
  });

  const { error: upsertError } = await supabase
    .from("cart_items")
    .upsert(upsertRows, { onConflict: "user_id,product_id,variant" });

  if (upsertError) {
    console.error("Failed to merge guest cart into server cart:", upsertError);
  }
}

export async function upsertServerQuantity(
  userId: string,
  productId: string,
  variant: string,
  quantity: number,
) {
  const nextQty = Math.max(1, quantity);
  const variantValue = normalizeVariant(variant);

  const { error } = await supabase.from("cart_items").upsert(
    { user_id: userId, product_id: productId, variant: variantValue, quantity: nextQty },
    { onConflict: "user_id,product_id,variant" },
  );

  if (error) {
    console.error("Failed to update server cart item:", error);
  }
}

export async function deleteServerItem(userId: string, productId: string, variant: string) {
  const variantValue = normalizeVariant(variant);

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("variant", variantValue);

  if (error) {
    console.error("Failed to delete server cart item:", error);
  }
}

export async function clearServerCart(userId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);

  if (error) {
    console.error("Failed to clear server cart:", error);
  }
}