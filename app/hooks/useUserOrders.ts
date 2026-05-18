"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { OrderWithItems } from "@/types/order";

type UseUserOrdersArgs = {
  user: User | null;
  loading: boolean;
};

type Snapshot = {
  orders: OrderWithItems[];
  isLoadingOrders: boolean;
  error: string | null;
};

const EMPTY_SNAPSHOT: Snapshot = {
  orders: [],
  isLoadingOrders: false,
  error: null,
};

const LOADING_SNAPSHOT: Snapshot = {
  orders: [],
  isLoadingOrders: true,
  error: null,
};

const ORDER_SELECT =
  "id, order_number, user_id, customer_name, customer_email, customer_phone, is_gift, shipping_address, billing_address, status, total, created_at, order_items(id, order_id, product_id, product_name, product_price, quantity, line_total, created_at)";

class UserOrdersStore {
  private readonly userId: string;
  private snapshot: Snapshot;
  private listeners = new Set<() => void>();
  private intervalId: number | null = null;
  private inFlight = false;
  private started = false;

  constructor(userId: string) {
    this.userId = userId;
    this.snapshot = {
      orders: [],
      isLoadingOrders: true,
      error: null,
    };
  }

  getSnapshot = () => this.snapshot;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    if (this.listeners.size === 1) {
      this.start();
    }

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  };

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private setSnapshot(next: Snapshot) {
    this.snapshot = next;
    this.emit();
  }

  private patchSnapshot(patch: Partial<Snapshot>) {
    this.setSnapshot({ ...this.snapshot, ...patch });
  }

  private start() {
    if (this.started) return;
    this.started = true;

    void this.fetchOnce({ showLoading: true });

    const intervalMs = 20000;
    this.intervalId = window.setInterval(() => {
      void this.fetchOnce({ showLoading: false });
    }, intervalMs);
  }

  private stop() {
    this.started = false;

    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.inFlight = false;
  }

  private async fetchOnce(options: { showLoading: boolean }) {
    if (this.inFlight) return;
    this.inFlight = true;

    try {
      if (options.showLoading) {
        this.patchSnapshot({ isLoadingOrders: true, error: null });
      } else if (this.snapshot.error) {
        this.patchSnapshot({ error: null });
      }

      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      if (error) {
        this.setSnapshot({
          orders: [],
          isLoadingOrders: false,
          error: error.message,
        });
        return;
      }

      this.setSnapshot({
        orders: (data ?? []) as OrderWithItems[],
        isLoadingOrders: false,
        error: null,
      });
    } catch (e) {
      this.setSnapshot({
        orders: [],
        isLoadingOrders: false,
        error: e instanceof Error ? e.message : "Failed to load orders.",
      });
    } finally {
      this.inFlight = false;
    }
  }
}

const stores = new Map<string, UserOrdersStore>();

function getStore(userId: string) {
  const existing = stores.get(userId);
  if (existing) return existing;

  const store = new UserOrdersStore(userId);
  stores.set(userId, store);
  return store;
}

export function useUserOrders({ user, loading }: UseUserOrdersArgs) {
  const userId = user?.id ?? null;

  const subscribe = (onStoreChange: () => void) => {
    if (loading || !userId) return () => {};
    return getStore(userId).subscribe(onStoreChange);
  };

  const getSnapshot = () => {
    if (loading) return LOADING_SNAPSHOT;
    if (!userId) return EMPTY_SNAPSHOT;
    return getStore(userId).getSnapshot();
  };

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return snapshot;
}