import type { Product } from "@/types/product";
import { mockProducts } from "@/lib/mockProducts";
import { supabaseServer } from "@/lib/supabaseServer";

export type ShopCategory =
  | "all"
  | "hand-crafts"
  | "accessories"
  | "rolling-pins"
  | "platters-and-trays"
  | "wooden-bowls"
  | "home-decor";

export type PriceRange =
  | "all"
  | "under-25"
  | "25-to-50"
  | "50-to-100"
  | "100-plus";

export type AvailabilityFilter = "all" | "instock";
export type DealsFilter = "all" | "sale";

export type ShopSearchParams = {
  search?: string;
  sort?: string;
  category?: string;
  price?: string;
  availability?: string;
  deals?: string;
};

export type StorefrontProduct = Product & {
  createdAt: string;
  featuredRank: number;
  category: ShopCategory;
  inStock: boolean;
  onSale: boolean;
};

type ProductRowBase = {
  id: string;
  name: string;
  price: number | string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

const FEATURED_PRODUCT_NAMES = [
  "Weller Board Wax",
  "Weller's Board Wax",
];

export const CATEGORY_OPTIONS: Array<{ value: ShopCategory; label: string }> = [
  { value: "all", label: "All Items" },
  { value: "hand-crafts", label: "Hand Crafts" },
  { value: "accessories", label: "Accessories" },
  { value: "rolling-pins", label: "Rolling Pins" },
  { value: "platters-and-trays", label: "Platters and Trays" },
  { value: "wooden-bowls", label: "Wooden Bowls" },
  { value: "home-decor", label: "Home Decor" },
];

export const PRICE_OPTIONS: Array<{ value: PriceRange; label: string }> = [
  { value: "all", label: "All Prices" },
  { value: "under-25", label: "Under $25" },
  { value: "25-to-50", label: "$25 to $50" },
  { value: "50-to-100", label: "$50 to $100" },
  { value: "100-plus", label: "$100 and up" },
];

export function getFeaturedRank(productName: string) {
  const normalizedName = productName.trim().toLowerCase();
  const index = FEATURED_PRODUCT_NAMES.findIndex(
    (name) => name.trim().toLowerCase() === normalizedName,
  );

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function getProductCategory(productName: string): ShopCategory {
  const normalizedName = productName.trim().toLowerCase();

  if (normalizedName.includes("rolling pin")) return "rolling-pins";
  if (normalizedName.includes("platter") || normalizedName.includes("tray"))
    return "platters-and-trays";
  if (normalizedName.includes("bowl")) return "wooden-bowls";

  if (
    normalizedName.includes("board wax") ||
    normalizedName.includes("weller") ||
    normalizedName.includes("salt") ||
    normalizedName.includes("pepper") ||
    normalizedName.includes("shaker")
  ) {
    return "accessories";
  }

  if (normalizedName.includes("vase")) {
    return "home-decor";
  }

  const isHandCraft =
    normalizedName.includes("seam ripper") ||
    normalizedName.includes("crochet hook") ||
    /\bpens?\b/.test(normalizedName);

  if (isHandCraft) {
    return "hand-crafts";
  }

  if (normalizedName.includes("decor") || normalizedName.includes("shaker")) {
    return "home-decor";
  }

  return "home-decor";
}

export function getSelectedCategory(value?: string): ShopCategory {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "hand-crafts" ||
    normalized === "accessories" ||
    normalized === "rolling-pins" ||
    normalized === "platters-and-trays" ||
    normalized === "wooden-bowls" ||
    normalized === "home-decor"
  ) {
    return normalized;
  }

  return "all";
}

export function getSelectedPriceRange(value?: string): PriceRange {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "under-25" ||
    normalized === "25-to-50" ||
    normalized === "50-to-100" ||
    normalized === "100-plus"
  ) {
    return normalized;
  }

  return "all";
}

export function getSelectedAvailability(value?: string): AvailabilityFilter {
  return value?.trim().toLowerCase() === "instock" ? "instock" : "all";
}

export function getSelectedDeals(value?: string): DealsFilter {
  return value?.trim().toLowerCase() === "sale" ? "sale" : "all";
}

export function matchesCategory(product: StorefrontProduct, category: ShopCategory) {
  return category === "all" ? true : product.category === category;
}

export function matchesPriceRange(product: StorefrontProduct, priceRange: PriceRange) {
  switch (priceRange) {
    case "under-25":
      return product.price < 25;
    case "25-to-50":
      return product.price >= 25 && product.price <= 50;
    case "50-to-100":
      return product.price > 50 && product.price <= 100;
    case "100-plus":
      return product.price > 100;
    case "all":
    default:
      return true;
  }
}

export function matchesAvailability(
  product: StorefrontProduct,
  availability: AvailabilityFilter,
) {
  return availability === "instock" ? product.inStock : true;
}

export function matchesDeals(product: StorefrontProduct, deals: DealsFilter) {
  return deals === "sale" ? product.onSale : true;
}

export function buildShopHref(
  params: ShopSearchParams,
  updates: Partial<{
    sort: string;
    category: ShopCategory;
    price: PriceRange;
    availability: AvailabilityFilter;
    deals: DealsFilter;
  }>,
) {
  const nextParams = new URLSearchParams();

  if (params.search?.trim()) nextParams.set("search", params.search.trim());

  const sort = updates.sort ?? params.sort?.trim().toLowerCase() ?? "featured";
  const category = updates.category ?? getSelectedCategory(params.category);
  const price = updates.price ?? getSelectedPriceRange(params.price);
  const availability =
    updates.availability ?? getSelectedAvailability(params.availability);
  const deals = updates.deals ?? getSelectedDeals(params.deals);

  if (sort !== "featured") nextParams.set("sort", sort);
  if (category !== "all") nextParams.set("category", category);
  if (price !== "all") nextParams.set("price", price);
  if (availability !== "all") nextParams.set("availability", availability);
  if (deals !== "all") nextParams.set("deals", deals);

  const queryString = nextParams.toString();
  return queryString ? `/shop?${queryString}` : "/shop";
}

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
    }));

  return products.length
    ? products
    : mockProducts.map((product, index) => ({
        ...product,
        createdAt: new Date(Date.now() - index * 60_000).toISOString(),
        featuredRank: getFeaturedRank(product.name),
        category: getProductCategory(product.name),
        inStock: true,
        onSale: false,
      }));
}

export function sortProducts(products: StorefrontProduct[], sort: string) {
  const sorted = [...products];

  switch (sort) {
    case "price-low":
      return sorted.sort((left, right) => left.price - right.price);

    case "price-high":
      return sorted.sort((left, right) => right.price - left.price);

    case "alphabetical":
      return sorted.sort((left, right) => left.name.localeCompare(right.name));

    case "newest":
      return sorted.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );

    case "featured":
    default:
      return sorted.sort((left, right) => {
        if (left.featuredRank !== right.featuredRank) {
          return left.featuredRank - right.featuredRank;
        }

        return (
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
        );
      });
  }
}