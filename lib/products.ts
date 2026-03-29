import type { Product } from "@/types/product";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getLandingHeroProduct(products: Product[]) {
  return (
    products.find((product) => {
      const name = normalize(product.name);
      const image = normalize(product.image);

      return (
        (name.includes("weller") &&
          name.includes("board") &&
          name.includes("wax")) ||
        image.includes("weller_board_wax")
      );
    }) ?? null
  );
}