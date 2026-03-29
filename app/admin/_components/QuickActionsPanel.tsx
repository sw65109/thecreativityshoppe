import Link from "next/link";
import { formatCurrency } from "../_lib/format";

export function QuickActionsPanel({ monthlyRevenue }: { monthlyRevenue: number }) {
  return (
    <div className="rounded-3xl border border-background/15 bg-background/10 p-6">
      <h3 className="text-2xl font-semibold">Quick Actions</h3>

      <div className="mt-6 grid gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-background/15 px-4 py-3 transition hover:bg-background hover:text-sandstone"
        >
          Manage Products
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-xl border border-background/15 px-4 py-3 transition hover:bg-background hover:text-sandstone"
        >
          Review Orders
        </Link>

        <Link
          href="/admin/users"
          className="rounded-xl border border-background/15 px-4 py-3 transition hover:bg-background hover:text-sandstone"
        >
          View Users
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-background/10 bg-background/10 p-4">
        <p className="text-sm text-background/60">This Month</p>
        <p className="mt-2 text-3xl font-semibold">
          {formatCurrency(monthlyRevenue)}
        </p>
      </div>
    </div>
  );
}