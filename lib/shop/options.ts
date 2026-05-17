import type { PriceRange, ShopCategory } from "./types";

export const CATEGORY_OPTIONS: Array<{ value: ShopCategory; label: string }> = [
  { value: "all", label: "All Items" },

  { value: "bowls", label: "Bowls" },
  { value: "candles-holders", label: "Candles & Holders" },
  { value: "hand-crafts", label: "Hand Crafts" },
  { value: "kitchen-utensils", label: "Kitchen Utensils" },
  { value: "ornaments", label: "Ornaments" },
  { value: "platters-trays", label: "Platters & Trays" },
  { value: "rolling-pins", label: "Rolling Pins" },
  { value: "salt-pepper-shakers", label: "Salt & Pepper Shakers" },
  { value: "vases-vessels", label: "Vases & Vessels" },
  { value: "pens", label: "Pens" },
  { value: "accessories", label: "Accessories" },
];

export const PRICE_OPTIONS: Array<{ value: PriceRange; label: string }> = [
  { value: "all", label: "All Prices" },
  { value: "under-25", label: "Under $25" },
  { value: "25-to-50", label: "$25 to $50" },
  { value: "50-to-100", label: "$50 to $100" },
  { value: "100-plus", label: "$100 and up" },
];