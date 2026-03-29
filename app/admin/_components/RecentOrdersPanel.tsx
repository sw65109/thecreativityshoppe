import Link from "next/link";
import type { RecentOrder } from "../_lib/getAdminDashboardData";
import { formatCurrency, formatStatus } from "../_lib/format";

export function RecentOrdersPanel({
  recentOrders,
}: {
  recentOrders: RecentOrder[];
}) {
  return (
    <div className="rounded-3xl border border-background/15 bg-background/10 p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-semibold">Recent Orders</h3>

        <Link
          href="/admin/orders"
          className="rounded-xl border border-background/15 px-4 py-3 transition hover:bg-background hover:text-sandstone"
        >
          View All Orders
        </Link>
      </div>

      <div className="hidden md:block mt-6 overflow-hidden rounded-2xl border border-background/10">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-background/10 text-left text-background/60">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-background/10 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-background/60">
                      Order #{order.order_number}
                    </p>
                    <p className="text-background/60">{order.customer_email}</p>
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {formatStatus(order.status)}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(Number(order.total ?? 0))}
                  </td>

                  <td className="px-4 py-3 text-background/60">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "Unknown"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-4 text-background/60" colSpan={4}>
                  No orders found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden mt-6 space-y-4">
        {recentOrders.length ? (
          recentOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-background/15 bg-background/10 p-4 space-y-2"
            >
              <p className="font-semibold">{order.customer_name}</p>
              <p className="text-background/60 text-sm">
                Order #{order.order_number}
              </p>
              <p className="text-background/60 text-sm">
                {order.customer_email}
              </p>

              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {formatStatus(order.status)}
              </p>

              <p className="text-sm">
                <span className="font-medium">Total:</span>{" "}
                {formatCurrency(Number(order.total ?? 0))}
              </p>

              <p className="text-background/60 text-sm">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-background/10 bg-background/10 p-4 text-background/60">
            No orders found yet.
          </div>
        )}
      </div>
    </div>
  );
}