"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminServerAuthed } from "@/lib/requireAdminServerAuthed";

const PROTECTED_ADMIN_ID = "a85e214b-b408-44be-a21a-58ee06115b62";

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

  if (userId === PROTECTED_ADMIN_ID) {
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