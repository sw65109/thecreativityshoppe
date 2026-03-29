"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/orders";
import { requireAdminServerAuthed } from "@/lib/requireAdminServerAuthed";

export async function changeOrderStatus(formData: FormData) {
  await requireAdminServerAuthed();

  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "")
    .trim()
    .toLowerCase();

  if (!orderId) {
    throw new Error("Order id is required.");
  }

  if (!status) {
    throw new Error("Order status is required.");
  }

  await updateOrderStatus(orderId, status);

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}
