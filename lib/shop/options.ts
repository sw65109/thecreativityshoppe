import type { PriceRange, ShopCategory } from "./types";

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