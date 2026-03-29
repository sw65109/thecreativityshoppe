import type { ProductRow, ProductView } from "./types";

export function buildProductViews(products: ProductRow[]): ProductView[] {
  return products.map((product) => {
    const galleryImages =
      product.product_images?.slice().sort((left, right) => {
        return left.sort_order - right.sort_order;
      }) ?? [];

    const primaryImage =
      galleryImages.find((image) => image.is_primary)?.image_url ??
      product.image_url;

    const nonPrimaryImages = galleryImages.filter((img) => !img.is_primary);
    const galleryThumbs = nonPrimaryImages.slice(0, 4);
    const remainingThumbs = nonPrimaryImages.length - galleryThumbs.length;

    const showFlags =
      typeof product.in_stock === "boolean" ||
      typeof product.on_sale === "boolean";

    return {
      product,
      galleryImages,
      primaryImage: primaryImage ?? null,
      galleryThumbs,
      remainingThumbs,
      showFlags,
    };
  });
}