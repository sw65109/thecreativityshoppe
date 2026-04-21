"use client";

import { supabase } from "@/lib/supabaseClient";
import type { SavedAddressRecord } from "@/lib/checkoutForm";

export type CheckoutProfileRow = {
  display_name: string | null;
  phone: string | null;
  email: string | null;
};

export async function loadCheckoutData(userId: string) {
  const [profileResult, addressesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, phone, email")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("addresses")
      .select(
        "id, label, full_name, line1, line2, city, state, postal_code, country, is_default_shipping, is_default_billing",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    profile: (profileResult.data ?? null) as CheckoutProfileRow | null,
    addresses: (addressesResult.data ?? []) as SavedAddressRecord[],
  };
}