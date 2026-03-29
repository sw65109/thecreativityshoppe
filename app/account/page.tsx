"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useAccountOverview } from "@/app/hooks/useAccountOverview";
import { formatPhoneNumberForDisplay } from "@/lib/phone";

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

export default function AccountOverviewPage() {
  const { user, initialized, loading, role } = useAuth();
  const { profile, recentOrders, orderCount, isPageLoading, error } =
    useAccountOverview({
      user,
      initialized,
    });

  if (!initialized || loading || isPageLoading) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
        Loading account...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <p className="text-background/75">Sign in to view your account.</p>
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-block rounded-full bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-background">
      {error ? (
        <div className="rounded-3xl border border-red-700/30 bg-red-100 p-6 text-red-800">
          Failed to load account overview: {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-background/20 bg-background/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-background/55">
            Name
          </p>
          <p className="mt-3 text-2xl font-semibold">
            {profile?.display_name || user.user_metadata?.full_name || "No name set"}
          </p>
        </div>

        <div className="rounded-3xl border border-background/20 bg-background/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-background/55">
            Email
          </p>
          <p className="mt-3 text-lg font-semibold">
            {profile?.email || user.email || "No email"}
          </p>
        </div>

        <div className="rounded-3xl border border-background/20 bg-background/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-background/55">
            Role
          </p>
          <p className="mt-3 text-2xl font-semibold capitalize">
            {profile?.role || role || "customer"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-background/20 bg-background/10 p-6">
          <h2 className="text-2xl font-semibold">Account Snapshot</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-background/15 bg-sandstone/60 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-background/55">
                Joined
              </p>
              <p className="mt-2 text-lg font-medium">
                {formatDate(profile?.created_at ?? user.created_at ?? null)}
              </p>
            </div>

            <div className="rounded-2xl border border-background/15 bg-sandstone/60 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-background/55">
                Phone
              </p>
              <p className="mt-2 text-lg font-medium">
                {profile?.phone
                  ? formatPhoneNumberForDisplay(profile.phone)
                  : "No phone number saved"}
              </p>
            </div>

            <div className="rounded-2xl border border-background/15 bg-sandstone/60 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-background/55">
                Orders
              </p>
              <p className="mt-2 text-lg font-medium">{orderCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Recent Orders</h2>
            <p className="mt-2 text-background/65">
              Your latest activity from this account.
            </p>
          </div>

          <Link
            href="/account/orders"
            className="rounded-xl border border-background/15 px-4 py-3 transition hover:bg-background hover:text-sandstone"
          >
            View All
          </Link>
        </div>

        <div className="mt-6 grid gap-3">
          {recentOrders.length ? (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-background/15 bg-sandstone/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-background/60">Order #{order.order_number}</p>
                    <p className="mt-1 text-lg font-semibold capitalize">
                      {order.status ?? "pending"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-sm text-background/60">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-background/15 bg-sandstone/60 p-4 text-background/70">
              No orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}