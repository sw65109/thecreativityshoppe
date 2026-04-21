import type {
  AvailabilityFilter,
  DealsFilter,
  PriceRange,
  ShopCategory,
  ShopSearchParams,
} from "./types";
import {
  getSelectedAvailability,
  getSelectedCategory,
  getSelectedDeals,
  getSelectedPriceRange,
} from "./filters";

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