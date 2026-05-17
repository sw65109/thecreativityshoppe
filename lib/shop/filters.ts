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
  const name = productName.trim().toLowerCase();

  if (name.includes("rolling pin")) return "rolling-pins";

  if (name.includes("platter") || name.includes("tray")) return "platters-trays";

  if (name.includes("bowl")) return "bowls";

  if (name.includes("vase") || name.includes("vessel")) return "vases-vessels";

  if (name.includes("shaker") || name.includes("salt") || name.includes("pepper")) {
    return "salt-pepper-shakers";
  }

  if (name.includes("candle") || name.includes("holder")) {
    return "candles-holders";
  }

  if (name.includes("ornament")) {
    return "ornaments";
  }

  if (
    name.includes("utensil") ||
    name.includes("spoon") ||
    name.includes("spatula") ||
    name.includes("ladle") ||
    name.includes("turner") ||
    name.includes("scoop")
  ) {
    return "kitchen-utensils";
  }

  if (/\bpens?\b/.test(name)) {
    return "pens";
  }

  const isHandCraft =
    name.includes("seam ripper") ||
    name.includes("crochet hook") ||
    name.includes("awl");

  if (isHandCraft) {
    return "hand-crafts";
  }

  if (
    name.includes("board wax") ||
    name.includes("weller") ||
    name.includes("seam ripper head") ||
    name.includes("crochet hook head") ||
    name.includes("awl head")
  ) {
    return "accessories";
  }

  return "accessories";
}

export function getSelectedCategory(value?: string): ShopCategory {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "bowls" ||
    normalized === "candles-holders" ||
    normalized === "hand-crafts" ||
    normalized === "kitchen-utensils" ||
    normalized === "ornaments" ||
    normalized === "platters-trays" ||
    normalized === "rolling-pins" ||
    normalized === "salt-pepper-shakers" ||
    normalized === "vases-vessels" ||
    normalized === "pens" ||
    normalized === "accessories"
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

export function matchesAvailability(product: StorefrontProduct, availability: AvailabilityFilter) {
  return availability === "all" ? true : product.inStock;
}

export function matchesDeals(product: StorefrontProduct, deals: DealsFilter) {
  return deals === "all" ? true : product.onSale;
}