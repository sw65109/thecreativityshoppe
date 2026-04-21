"use client";

import { supabase } from "@/lib/supabaseClient";
import {
  PROFILE_AVATAR_BUCKET,
  getFileExtension,
  getStorageAvatarPath,
} from "@/lib/avatar";

export async function uploadAvatar(userId: string, file: File) {
  const extension = getFileExtension(file.name);
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteAvatarObject(avatarUrl: string) {
  const storagePath = getStorageAvatarPath(avatarUrl);

  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([storagePath]);

  if (error) {
    throw new Error(error.message);
  }
}