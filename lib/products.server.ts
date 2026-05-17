import "server-only";

import type { Product } from "@/types/product";
import { mockProducts } from "@/lib/mockProducts";
import { supabaseServer } from "@/lib/supabaseServer";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export type ProductImageRow = {
  id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  variant: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  product_images: ProductImageRow[] | null;
};

export type StorefrontProductWithImages = Product & {
  images: string[];
  imageRows: ProductImageRow[];
};

export type VariantConfig = { label: string; options: string[] };

function normalizeVariant(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function coerceToOption(value: unknown, options: string[]) {
  const target = normalizeVariant(value);
  if (!target) return null;

  for (const option of options) {
    if (normalizeVariant(option) === target) return option;
  }

  return null;
}

const TOOL_WOOD_OPTIONS = [
  "Purple Heart",
  "Padauk",
  "Walnut",
  "Cherry",
  "Hard maple",
  "Honey Locust",
  "Pecan",
];

export function getProductVariantConfig(productName: string): VariantConfig | null {
  const name = normalize(productName);

  if (name.includes("seam") && name.includes("ripper")) {
    return { label: "Wood", options: TOOL_WOOD_OPTIONS };
  }

  if (name.includes("crochet") && name.includes("hook")) {
    return { label: "Wood", options: TOOL_WOOD_OPTIONS };
  }

  if (name.includes("short") && name.includes("french") && name.includes("rolling")) {
    return { label: "Wood", options: ["Hard Maple", "Walnut", "Cherry"] };
  }

  if (name.includes("long") && name.includes("french") && name.includes("rolling")) {
    return { label: "Wood", options: ["Hard Maple", "Walnut", "Cherry"] };
  }
  
  if (name.includes("medium") && name.includes("french") && name.includes("rolling")) {
    return { label: "Wood", options: ["Hard Maple", "Walnut", "Cherry"] };
  }

  if (name.includes("french") && name.includes("rolling")) {
    return { label: "Wood", options: ["Hard Maple", "Walnut", "Cherry"] };
  }

  if (name.includes("pen")) {
    return { label: "Wood", options: TOOL_WOOD_OPTIONS };
  }

  if (name.includes("awl")) {
    return { label: "Wood", options: TOOL_WOOD_OPTIONS };
  }

  return null;
}

export function getProductSecondaryVariantConfig(productName: string): VariantConfig | null {
  const name = normalize(productName);

  if (name.includes("pen")) {
    return { label: "Mechanism", options: ["Click", "Twist"] };
  }

  return null;
}

function buildGallery(product: ProductRow) {
  const sortedGallery =
    product.product_images?.slice().sort((left, right) => {
      if (left.is_primary && !right.is_primary) return -1;
      if (!left.is_primary && right.is_primary) return 1;
      return left.sort_order - right.sort_order;
    }) ?? [];

  const imageRows = sortedGallery.filter((row) => Boolean(row.image_url));
  const galleryUrls = imageRows.map((row) => row.image_url).filter(Boolean);

  const primaryImage = galleryUrls[0] ?? product.image_url ?? "";
  const allImages = Array.from(new Set([primaryImage, ...galleryUrls].filter(Boolean)));

  return { imageRows, primaryImage, allImages };
}

export function resolveSelectedVariant(woodParam: unknown, config: VariantConfig | null) {
  if (!config?.options?.length) return "";

  return coerceToOption(woodParam, config.options) ?? config.options[0] ?? "";
}

export function selectVariantImages(imageRows: ProductImageRow[], selectedVariant: string) {
  const selectedKey = normalizeVariant(selectedVariant);

  const variantMatchedRows =
    selectedKey && imageRows.length
      ? imageRows.filter((row) => normalizeVariant(row.variant) === selectedKey)
      : [];

  const defaultRows = imageRows.length
    ? imageRows.filter((row) => !normalizeVariant(row.variant))
    : [];

  const activeRows = variantMatchedRows.length
    ? variantMatchedRows
    : defaultRows.length
      ? defaultRows
      : imageRows;

  const activeUrls = Array.from(new Set(activeRows.map((row) => row.image_url).filter(Boolean)));

  return activeUrls;
}

export async function getStorefrontProductsWithImages(): Promise<StorefrontProductWithImages[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(
      "id, name, price, description, image_url, created_at, product_images(id, image_url, sort_order, is_primary, created_at, variant)",
    )
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return mockProducts.map((product) => ({
      ...product,
      images: [product.image].filter(Boolean),
      imageRows: [],
    }));
  }

  const products = (data as ProductRow[]).map((product) => {
    const { imageRows, primaryImage, allImages } = buildGallery(product);

    return {
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image: primaryImage,
      description: product.description?.trim() || "No description available.",
      images: allImages.length ? allImages : [primaryImage].filter(Boolean),
      imageRows,
    };
  });

  const valid = products.filter((p) => p.image && p.images.length > 0);

  return valid.length
    ? valid
    : mockProducts.map((product) => ({
        ...product,
        images: [product.image].filter(Boolean),
        imageRows: [],
      }));
}

export type ProductPageModel = {
  product: StorefrontProductWithImages;
  relatedProducts: StorefrontProductWithImages[];
  variantConfig: VariantConfig | null;
  secondaryVariantConfig: VariantConfig | null;
  selectedVariant: string;
  activeUrls: string[];
  activePrimaryImage: string;
};

export async function getProductPageModel(input: {
  id: string;
  wood?: string;
}): Promise<ProductPageModel | null> {
  const products = await getStorefrontProductsWithImages();
  const product = products.find((item) => item.id === input.id);

  if (!product) return null;

  const relatedProducts = products.filter((item) => item.id !== product.id);

  const variantConfig = getProductVariantConfig(product.name);
  const secondaryVariantConfig = getProductSecondaryVariantConfig(product.name);
  const selectedVariant = resolveSelectedVariant(input.wood, variantConfig);

  const activeUrls = product.imageRows.length
    ? selectVariantImages(product.imageRows, selectedVariant)
    : product.images;

  const activePrimaryImage = activeUrls[0] ?? product.image;

  return {
    product,
    relatedProducts,
    variantConfig,
    secondaryVariantConfig,
    selectedVariant,
    activeUrls,
    activePrimaryImage,
  };
}