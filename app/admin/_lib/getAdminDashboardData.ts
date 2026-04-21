import { supabaseServer } from "@/lib/supabaseServer";
import { formatCurrency } from "./format";

export type DashboardCard = { title: string; value: string };

export type RecentOrder = {
  id: string;
  order_number: string | number | null;
  customer_name: string | null;
  customer_email: string | null;
  promo_code?: string | null;
  subtotal?: number | string | null;
  discount_total?: number | string | null;
  status: string | null;
  total: number | string | null;
  created_at: string | null;
};

export type AdminDashboardDataResult =
  | {
      ok: true;
      cards: DashboardCard[];
      recentOrders: RecentOrder[];
      monthlyRevenue: number;
    }
  | {
      ok: false;
      error: string;
    };

const REVENUE_STATUSES: string[] = ["paid", "processing", "shipped", "completed"];

export async function getAdminDashboardData(): Promise<AdminDashboardDataResult> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    productsResult,
    usersResult,
    ordersCountResult,
    openOrdersResult,
    monthlyRevenueResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabaseServer.from("products").select("*", { count: "exact", head: true }),
    supabaseServer.from("profiles").select("*", { count: "exact", head: true }),
    supabaseServer.from("orders").select("*", { count: "exact", head: true }),
    supabaseServer
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "paid", "processing"]),
    supabaseServer
      .from("orders")
      .select("total, created_at")
      .gte("created_at", startOfMonth.toISOString())
      .in("status", REVENUE_STATUSES),
    supabaseServer
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_email, promo_code, subtotal, discount_total, status, total, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const dashboardError =
    productsResult.error ||
    usersResult.error ||
    ordersCountResult.error ||
    openOrdersResult.error ||
    monthlyRevenueResult.error ||
    recentOrdersResult.error;

  if (dashboardError) {
    return { ok: false, error: dashboardError.message };
  }

  const monthlyRevenue = (monthlyRevenueResult.data ?? []).reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0,
  );

  const cards: DashboardCard[] = [
    { title: "Products", value: String(productsResult.count ?? 0) },
    { title: "Orders", value: String(ordersCountResult.count ?? 0) },
    { title: "Users", value: String(usersResult.count ?? 0) },
    { title: "Revenue", value: formatCurrency(monthlyRevenue) },
  ];

  return {
    ok: true,
    cards,
    recentOrders: (recentOrdersResult.data ?? []) as RecentOrder[],
    monthlyRevenue,
  };
}