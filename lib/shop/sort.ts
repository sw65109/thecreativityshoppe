import type { StorefrontProduct } from "./types";

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
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );

    case "featured":
    default:
      return sorted.sort((left, right) => {
        if (left.featuredRank !== right.featuredRank) {
          return left.featuredRank - right.featuredRank;
        }

        return (
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );
      });
  }
}