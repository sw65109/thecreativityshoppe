import { supabaseServer } from "@/lib/supabaseServer";

const PRODUCT_IMAGE_BUCKET = "product-images";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "jpg") : "jpg";
}

export function normalizeVariantForDb(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function uploadProductImage(file: File) {
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

  const { data } = supabaseServer.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function removeProductImageObjectsByUrls(imageUrls: string[]) {
  const publicPrefix = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

  const pathsToRemove = imageUrls
    .map((u) => (u ?? "").trim())
    .map((url) => {
      const idx = url.indexOf(publicPrefix);
      if (idx === -1) return null;
      return url.slice(idx + publicPrefix.length);
    })
    .filter((p): p is string => Boolean(p));

  if (!pathsToRemove.length) {
    return;
  }

  await supabaseServer.storage.from(PRODUCT_IMAGE_BUCKET).remove(pathsToRemove);
}