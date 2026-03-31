export type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  variant: string | null;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  created_at: string;
  in_stock?: boolean;
  on_sale?: boolean;
  product_images: ProductImage[] | null;
};

export type ProductView = {
  product: ProductRow;
  galleryImages: ProductImage[];
  primaryImage: string | null;
  galleryThumbs: ProductImage[];
  remainingThumbs: number;
  showFlags: boolean;
};