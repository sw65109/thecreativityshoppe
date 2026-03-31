"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminServerAuthed } from "@/lib/requireAdminServerAuthed";

const PRODUCT_IMAGE_BUCKET = "product-images";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "jpg") : "jpg";
}

function normalizeVariantForDb(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

async function uploadProductImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = getFileExtension(file.name);
  const filePath = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseServer.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabaseServer.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function addProduct(formData: FormData) {
  await requireAdminServerAuthed();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceValue = String(formData.get("price") ?? "").trim();
  const manualPrimaryImageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageVariant = normalizeVariantForDb(formData.get("imageVariant"));

  const uploadedFiles = formData
    .getAll("imageFiles")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!description) {
    throw new Error("Product description is required.");
  }

  const price = Number(priceValue);

  if (Number.isNaN(price)) {
    throw new Error("Price must be a valid number.");
  }

  const uploadedImageUrls: string[] = [];

  for (const file of uploadedFiles) {
    const publicUrl = await uploadProductImage(file);
    uploadedImageUrls.push(publicUrl);
  }

  const allImageUrls = [
    ...(manualPrimaryImageUrl ? [manualPrimaryImageUrl] : []),
    ...uploadedImageUrls,
  ];

  const primaryImageUrl = allImageUrls[0] ?? null;

  const { data: product, error: productError } = await supabaseServer
    .from("products")
    .insert({
      name,
      description,
      price,
      image_url: primaryImageUrl,
    })
    .select("id")
    .single();

  if (productError) {
    throw new Error(productError.message);
  }

  if (allImageUrls.length > 0) {
    const imageRows = allImageUrls.map((imageUrl, index) => ({
      product_id: product.id,
      image_url: imageUrl,
      sort_order: index,
      is_primary: index === 0,
      variant: imageVariant,
    }));

    const { error: imageInsertError } = await supabaseServer
      .from("product_images")
      .insert(imageRows);

    if (imageInsertError) {
      throw new Error(imageInsertError.message);
    }
  }

  revalidatePath("/admin/products");
}

type ProductImageRemoveRow = { id: string; image_url: string | null };
type ProductImageSortOrderRow = { sort_order: number | null };
type ProductImageListRow = {
  id: string;
  image_url: string;
  sort_order: number;
};

export async function updateProduct(formData: FormData) {
  await requireAdminServerAuthed();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceValue = String(formData.get("price") ?? "").trim();

  if (!id) {
    throw new Error("Product id is required.");
  }

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!description) {
    throw new Error("Product description is required.");
  }

  const price = Number(priceValue);

  if (Number.isNaN(price)) {
    throw new Error("Price must be a valid number.");
  }

  const inStockRaw = formData.get("in_stock");
  const onSaleRaw = formData.get("on_sale");

  const updateBase: Record<string, unknown> = {
    name,
    description,
    price,
  };

  const updateWithFlags: Record<string, unknown> = {
    ...updateBase,
    in_stock: inStockRaw === "on",
    on_sale: onSaleRaw === "on",
  };

  const { error: updateError } = await supabaseServer
    .from("products")
    .update(updateWithFlags)
    .eq("id", id);

  if (updateError) {
    const message = updateError.message.toLowerCase();

    const looksLikeMissingColumn =
      message.includes("column") && message.includes("does not exist");

    if (!looksLikeMissingColumn) {
      throw new Error(updateError.message);
    }

    const { error: retryError } = await supabaseServer
      .from("products")
      .update(updateBase)
      .eq("id", id);

    if (retryError) {
      throw new Error(retryError.message);
    }
  }

  const removeIds = formData
    .getAll("remove_image_ids")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const removeSet = new Set(removeIds);

  if (removeIds.length) {
    const { data: rowsToRemoveData, error: selectRemoveError } =
      await supabaseServer
        .from("product_images")
        .select("id, image_url")
        .eq("product_id", id)
        .in("id", removeIds);

    if (selectRemoveError) {
      throw new Error(selectRemoveError.message);
    }

    const rowsToRemove = (rowsToRemoveData ?? []) as ProductImageRemoveRow[];

    const { error: deleteImagesError } = await supabaseServer
      .from("product_images")
      .delete()
      .eq("product_id", id)
      .in("id", removeIds);

    if (deleteImagesError) {
      throw new Error(deleteImagesError.message);
    }

    const publicPrefix = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

    const pathsToRemove = rowsToRemove
      .map((row) => (row.image_url ?? "").trim())
      .map((url) => {
        const idx = url.indexOf(publicPrefix);
        if (idx === -1) return null;
        return url.slice(idx + publicPrefix.length);
      })
      .filter((p): p is string => Boolean(p));

    if (pathsToRemove.length) {
      await supabaseServer.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .remove(pathsToRemove);
    }
  }

  // Update existing image wood tags (variant)
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("image_variant_")) continue;

    const imageId = key.slice("image_variant_".length).trim();
    if (!imageId) continue;
    if (removeSet.has(imageId)) continue;

    const nextVariant = normalizeVariantForDb(value);

    const { error } = await supabaseServer
      .from("product_images")
      .update({ variant: nextVariant })
      .eq("product_id", id)
      .eq("id", imageId);

    if (error) {
      throw new Error(error.message);
    }
  }

  const newFiles = formData
    .getAll("newImageFiles")
    .filter((v): v is File => v instanceof File && v.size > 0);

  const newImagesVariant = normalizeVariantForDb(formData.get("newImagesVariant"));

  if (newFiles.length) {
    const { data: lastData, error: lastError } = await supabaseServer
      .from("product_images")
      .select("sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (lastError) {
      throw new Error(lastError.message);
    }

    const last = (lastData ?? []) as ProductImageSortOrderRow[];
    const lastSortOrder = last[0]?.sort_order;
    const startOrder =
      typeof lastSortOrder === "number" && Number.isFinite(lastSortOrder)
        ? lastSortOrder + 1
        : 0;

    const uploadedUrls: string[] = [];
    for (const file of newFiles) {
      uploadedUrls.push(await uploadProductImage(file));
    }

    const rows = uploadedUrls.map((imageUrl, index) => ({
      product_id: id,
      image_url: imageUrl,
      sort_order: startOrder + index,
      is_primary: false,
      variant: newImagesVariant,
    }));

    const { error: insertError } = await supabaseServer
      .from("product_images")
      .insert(rows);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const requestedPrimaryId = String(
    formData.get("primary_image_id") ?? "",
  ).trim();

  const { data: allImagesData, error: allImagesError } = await supabaseServer
    .from("product_images")
    .select("id, image_url, sort_order")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  if (allImagesError) {
    throw new Error(allImagesError.message);
  }

  const images = (allImagesData ?? []) as ProductImageListRow[];

  const primaryCandidate =
    (requestedPrimaryId
      ? (images.find((img) => img.id === requestedPrimaryId) ?? null)
      : null) ??
    images[0] ??
    null;

  if (primaryCandidate) {
    await supabaseServer
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", id);

    await supabaseServer
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", primaryCandidate.id);

    await supabaseServer
      .from("products")
      .update({ image_url: primaryCandidate.image_url })
      .eq("id", id);
  } else {
    await supabaseServer
      .from("products")
      .update({ image_url: null })
      .eq("id", id);
  }

  revalidatePath("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdminServerAuthed();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Product id is required.");
  }

  const { error } = await supabaseServer.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
}