import { supabase } from "@/lib/supabaseClient";

export type UserRole = "admin" | "customer";

export async function getUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role === "admin" ? "admin" : "customer";
}