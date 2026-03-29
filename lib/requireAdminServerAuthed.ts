import "server-only";
import { supabaseServerAuthed } from "@/lib/supabaseServerAuthed";

export async function requireAdminServerAuthed() {
  const supabase = await supabaseServerAuthed();

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    throw new Error("Admin access required.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Could not verify admin role.");
  }

  if (profile?.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return { userId: data.user.id };
}