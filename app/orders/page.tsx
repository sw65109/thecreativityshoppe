"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useUserOrders } from "@/app/hooks/useUserOrders";
import { formatPhoneNumberForDisplay } from "@/lib/phone";
import type { CheckoutAddress } from "@/types/order";

function formatCurrency(value: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatAddressLines(address: CheckoutAddress | null) {
  if (!address) {
    return [];
  }

  return [
    address.fullName,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`.trim(),
    address.country,
  ].filter(Boolean);
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const { orders, isLoadingOrders, error } = useUserOrders({
    user,
    loading,
  });

  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<{
    orderId: string;
    text: string;
  } | null>(null);

  const [guestOrderNumber, setGuestOrderNumber] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPostalCode, setGuestPostalCode] = useState("");
  const [isGuestCancelling, setIsGuestCancelling] = useState(false);
  const [guestCancelMessage, setGuestCancelMessage] = useState<string | null>(
    null,
  );

  async function cancelOrder(orderId: string) {
    const confirmed = window.confirm(
      "Cancel this order and refund the payment? This is only allowed before it ships.",
    );
    if (!confirmed) return;

    setIsCancelling(orderId);
    setCancelMessage(null);

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to cancel order.");
      }

      window.location.reload();
    } catch (e) {
      setCancelMessage({
        orderId,
        text: e instanceof Error ? e.message : "Failed to cancel order.",
      });
    } finally {
      setIsCancelling(null);
    }
  }

  async function cancelGuestOrder() {
    const confirmed = window.confirm(
      "Cancel this order and refund the payment? This is only allowed before it ships.",
    );
    if (!confirmed) return;

    const parsedOrderNumber = Number(guestOrderNumber);

    if (!Number.isFinite(parsedOrderNumber) || parsedOrderNumber < 1) {
      setGuestCancelMessage("Enter a valid order number.");
      return;
    }

    if (!guestEmail.trim()) {
      setGuestCancelMessage("Enter the email used for the order.");
      return;
    }

    if (!guestPostalCode.trim()) {
      setGuestCancelMessage("Enter the shipping ZIP/postal code.");
      return;
    }

    setIsGuestCancelling(true);
    setGuestCancelMessage(null);

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: parsedOrderNumber,
          customerEmail: guestEmail.trim(),
          postalCode: guestPostalCode.trim(),
        }),
      });

      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to cancel order.");
      }

      setGuestCancelMessage(
        "Order cancelled. If it was paid, the refund has been started.",
      );
    } catch (e) {
      setGuestCancelMessage(
        e instanceof Error ? e.message : "Failed to cancel order.",
      );
    } finally {
      setIsGuestCancelling(false);
    }
  }

  return (
    <section className="min-h-screen bg-sandstone px-6 py-12 text-background md:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Account
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Your Orders</h1>
          <p className="mt-3 max-w-2xl text-background/70">
            Review the contact and shipping details stored with each order.
          </p>
        </div>

        {loading || isLoadingOrders ? (
          <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
            Loading orders...
          </div>
        ) : !user ? (
          <div className="grid gap-6">
            <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
              Sign in to view your order history.
            </div>

            <div className="rounded-3xl border border-background/20 bg-background/10 p-6">
              <h2 className="text-xl font-semibold">Guest order cancellation</h2>
              <p className="mt-2 text-sm text-background/70">
                If you checked out as a guest, enter the email used for the
                order, your order number, and the shipping ZIP/postal code.
              </p>

              {guestCancelMessage ? (
                <div className="mt-4 rounded-2xl border border-background/15 bg-sandstone/60 p-4 text-sm text-background/80">
                  {guestCancelMessage}
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm text-background/70">Order #</label>
                  <input
                    value={guestOrderNumber}
                    onChange={(e) => setGuestOrderNumber(e.target.value)}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-background/15 bg-sandstone px-3 py-2 text-background outline-none"
                    placeholder="1234"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-background/70">Email</label>
                  <input
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    type="email"
                    className="w-full rounded-xl border border-background/15 bg-sandstone px-3 py-2 text-background outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-background/70">
                    Shipping ZIP
                  </label>
                  <input
                    value={guestPostalCode}
                    onChange={(e) => setGuestPostalCode(e.target.value)}
                    className="w-full rounded-xl border border-background/15 bg-sandstone px-3 py-2 text-background outline-none"
                    placeholder="12345"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => void cancelGuestOrder()}
                disabled={isGuestCancelling}
                className="mt-5 rounded-xl border border-background/20 px-4 py-2 text-sm font-semibold transition hover:bg-background hover:text-sandstone disabled:opacity-60"
              >
                {isGuestCancelling ? "Cancelling..." : "Cancel Guest Order"}
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-400/40 bg-red-500/10 p-6 text-red-200">
            Failed to load orders: {error}
          </div>
        ) : !orders.length ? (
          <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
            No orders found for this account yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => {
              const normalizedStatus = String(order.status ?? "")
                .trim()
                .toLowerCase();

              const canCancel =
                normalizedStatus !== "shipped" &&
                normalizedStatus !== "completed" &&
                normalizedStatus !== "cancelled";

              const showCancelMessage =
                cancelMessage?.orderId === order.id ? cancelMessage.text : null;

              return (
                <article
                  key={order.id}
                  className="rounded-3xl border border-background/20 bg-background/10 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="mt-1 text-2xl font-semibold">
                        {order.customer_name}
                      </h2>
                      <p className="text-sm text-background/60">
                        Order #{order.order_number}
                      </p>
                      <p className="mt-1 text-background/70">
                        {order.customer_email}
                      </p>
                      <p className="mt-1 text-background/60">
                        {order.customer_phone
                          ? formatPhoneNumberForDisplay(order.customer_phone)
                          : "No phone saved"}
                      </p>

                      {order.is_gift ? (
                        <span className="mt-3 inline-block rounded-full border border-background/15 px-3 py-1 text-xs">
                          Gift Shipment
                        </span>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <p className="text-sm uppercase tracking-[0.2em] text-background/60">
                        Status
                      </p>
                      <p className="mt-1 text-lg font-semibold capitalize">
                        {order.status}
                      </p>
                      <p className="mt-3 text-xl font-semibold">
                        {formatCurrency(order.total)}
                      </p>

                      {showCancelMessage ? (
                        <p className="mt-3 text-sm text-red-200">
                          {showCancelMessage}
                        </p>
                      ) : null}

                      {canCancel ? (
                        <button
                          type="button"
                          onClick={() => void cancelOrder(order.id)}
                          disabled={isCancelling === order.id}
                          className="mt-4 rounded-xl border border-background/20 px-4 py-2 text-sm font-semibold transition hover:bg-background hover:text-sandstone disabled:opacity-60"
                        >
                          {isCancelling === order.id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-background/15 bg-sandstone/60 p-4">
                      <p className="text-sm uppercase tracking-[0.2em] text-background/55">
                        Shipping Address
                      </p>
                      <div className="mt-3 space-y-1 text-background/80">
                        {formatAddressLines(order.shipping_address).length ? (
                          formatAddressLines(order.shipping_address).map(
                            (line) => <p key={line}>{line}</p>,
                          )
                        ) : (
                          <p>No shipping address stored.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-background/15 bg-sandstone/60 p-4">
                      <p className="text-sm uppercase tracking-[0.2em] text-background/55">
                        Billing Address
                      </p>
                      <div className="mt-3 space-y-1 text-background/80">
                        {formatAddressLines(order.billing_address).length ? (
                          formatAddressLines(order.billing_address).map(
                            (line) => <p key={line}>{line}</p>,
                          )
                        ) : (
                          <p>No billing address stored.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-background/15">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-background/15 text-left text-background/60">
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Qty</th>
                          <th className="px-4 py-3">Unit Price</th>
                          <th className="px-4 py-3">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.order_items?.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-background/10 last:border-b-0"
                          >
                            <td className="px-4 py-3">{item.product_name}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3">
                              {formatCurrency(item.product_price)}
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(item.line_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}