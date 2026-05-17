import type { Product } from "@/types/product";

export type ShopCategory =
  | "all"
  | "bowls"
  | "candles-holders"
  | "hand-crafts"
  | "kitchen-utensils"
  | "ornaments"
  | "platters-trays"
  | "rolling-pins"
  | "salt-pepper-shakers"
  | "vases-vessels"
  | "pens"
  | "accessories";

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

  view?: string;
  subcategory?: string;
};

export type StorefrontProduct = Product & {
  createdAt: string;
  featuredRank: number;
  category: ShopCategory;
  inStock: boolean;
  onSale: boolean;
};