"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminServerAuthed } from "@/lib/requireAdminServerAuthed";

const PROTECTED_ADMIN_IDS = (process.env.PROTECTED_ADMIN_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export async function makeAdmin(formData: FormData) {
  await requireAdminServerAuthed();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    throw new Error("User id is required.");
  }

  const { error } = await supabaseServer
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}

export async function removeAdmin(formData: FormData) {
  await requireAdminServerAuthed();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    throw new Error("User id is required.");
  }

  if (PROTECTED_ADMIN_IDS.includes(userId)) {
    throw new Error("This admin account is protected and cannot be demoted.");
  }

  const { error } = await supabaseServer
    .from("profiles")
    .update({ role: "customer" })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}