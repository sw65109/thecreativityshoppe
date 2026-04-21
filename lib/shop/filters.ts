import type {
  AvailabilityFilter,
  DealsFilter,
  PriceRange,
  ShopCategory,
  StorefrontProduct,
} from "./types";

const FEATURED_PRODUCT_NAMES = ["Weller Board Wax", "Weller's Board Wax"];

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

export function matchesCategory(
  product: StorefrontProduct,
  category: ShopCategory,
) {
  return category === "all" ? true : product.category === category;
}

export function matchesPriceRange(
  product: StorefrontProduct,
  priceRange: PriceRange,
) {
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