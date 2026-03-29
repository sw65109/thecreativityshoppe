"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export type AccountProfile = {
  id: string;
  email: string | null;
  role: "admin" | "customer" | null;
  created_at: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type RecentOrder = {
  id: string;
  order_number: number;
  status: string | null;
  total: number | null;
  created_at: string | null;
};

type UseAccountOverviewArgs = {
  user: User | null;
  initialized: boolean;
};

export function useAccountOverview({
  user,
  initialized,
}: UseAccountOverviewArgs) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      if (!initialized) {
        return;
      }

      if (!user) {
        setProfile(null);
        setRecentOrders([]);
        setOrderCount(0);
        setIsPageLoading(false);
        return;
      }

      setIsPageLoading(true);
      setError(null);

      const [profileResult, ordersResult, orderCountResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, role, created_at, display_name, phone, avatar_url")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("orders")
          .select("id, order_number, status, total, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      if (profileResult.error) {
        setError(profileResult.error.message);
        setProfile(null);
      } else {
        setProfile((profileResult.data as AccountProfile | null) ?? null);
      }

      if (ordersResult.error) {
        setError(ordersResult.error.message);
        setRecentOrders([]);
      } else {
        setRecentOrders((ordersResult.data as RecentOrder[]) ?? []);
      }

      setOrderCount(orderCountResult.count ?? 0);
      setIsPageLoading(false);
    }

    void loadOverview();
  }, [initialized, user]);

  return {
    profile,
    recentOrders,
    orderCount,
    isPageLoading,
    error,
  };
}