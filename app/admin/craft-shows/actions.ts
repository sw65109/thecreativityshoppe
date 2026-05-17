"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdminServerAuthed } from "@/lib/requireAdminServerAuthed";

function cleanText(value: FormDataEntryValue | null) {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

function cleanDate(value: FormDataEntryValue | null) {
  const v = String(value ?? "").trim();
  return v.length ? v : null; // "YYYY-MM-DD"
}

export async function createCraftShow(formData: FormData) {
  await requireAdminServerAuthed();

  const name = cleanText(formData.get("name"));
  const location = cleanText(formData.get("location"));
  const start_date = cleanDate(formData.get("start_date"));
  const end_date = cleanDate(formData.get("end_date"));
  const is_active = String(formData.get("is_active") ?? "on") === "on";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  if (!name) throw new Error("Name is required.");
  if (!start_date) throw new Error("Start date is required.");

  const { error } = await supabaseServer.from("craft_shows").insert({
    name,
    location,
    start_date,
    end_date,
    is_active,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/craft-shows");
}

export async function updateCraftShow(formData: FormData) {
  await requireAdminServerAuthed();

  const id = String(formData.get("id") ?? "").trim();
  const name = cleanText(formData.get("name"));
  const location = cleanText(formData.get("location"));
  const start_date = cleanDate(formData.get("start_date"));
  const end_date = cleanDate(formData.get("end_date"));
  const is_active = String(formData.get("is_active") ?? "off") === "on";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  if (!id) throw new Error("Missing id.");
  if (!name) throw new Error("Name is required.");
  if (!start_date) throw new Error("Start date is required.");

  const { error } = await supabaseServer
    .from("craft_shows")
    .update({
      name,
      location,
      start_date,
      end_date,
      is_active,
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/craft-shows");
}

export async function deleteCraftShow(formData: FormData) {
  await requireAdminServerAuthed();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing id.");

  const { error } = await supabaseServer.from("craft_shows").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/craft-shows");
}