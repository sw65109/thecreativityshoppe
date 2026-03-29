"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { OrderWithItems } from "@/types/order";

type UseUserOrdersArgs = {
  user: User | null;
  loading: boolean;
};

export function useUserOrders({ user, loading }: UseUserOrdersArgs) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (loading) {
        return;
      }

      if (!user) {
        setOrders([]);
        setIsLoadingOrders(false);
        return;
      }

      setIsLoadingOrders(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("orders")
        .select(
          "id, order_number, user_id, customer_name, customer_email, customer_phone, is_gift, shipping_address, billing_address, status, total, created_at, order_items(id, order_id, product_id, product_name, product_price, quantity, line_total, created_at)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setOrders([]);
      } else {
        setOrders((data ?? []) as OrderWithItems[]);
      }

      setIsLoadingOrders(false);
    }

    void loadOrders();
  }, [loading, user]);

  return {
    orders,
    isLoadingOrders,
    error,
  };
}