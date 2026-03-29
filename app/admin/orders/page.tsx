import { supabaseServer } from "@/lib/supabaseServer";
import { ORDER_STATUS_OPTIONS, type CheckoutAddress, type OrderWithItems } from "@/types/order";
import { changeOrderStatus } from "./actions";

function formatCurrency(value: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function normalizeStatus(status: string | null) {
  return (status ?? "pending").trim().toLowerCase();
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

export default async function AdminOrdersPage() {
  const { data: orders, error } = await supabaseServer
    .from("orders")
    .select(
      "id, order_number, user_id, customer_name, customer_email, customer_phone, is_gift, shipping_address, billing_address, status, total, created_at, order_items(id, order_id, product_id, product_name, product_price, quantity, line_total, created_at)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="space-y-8 text-background">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Admin
          </p>
          <h2 className="mt-4 text-4xl font-semibold">Orders</h2>
          <p className="mt-3 text-red-700">Failed to load orders: {error.message}</p>
        </div>
      </section>
    );
  }

  const typedOrders = (orders ?? []) as OrderWithItems[];

  return (
    <section className="space-y-8 text-background">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-background/60">
          Admin
        </p>
        <h2 className="mt-4 text-4xl font-semibold">Orders</h2>
        <p className="mt-3 text-background/70">
          Review live orders from Supabase, including fulfillment details, and update their status.
        </p>
      </div>

      <div className="grid gap-4">
        {typedOrders.length ? (
          typedOrders.map((order) => {
            const normalizedStatus = normalizeStatus(order.status);
            const statusOptions = Array.from(
              new Set([normalizedStatus, ...ORDER_STATUS_OPTIONS]),
            );

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-background/15 bg-background/10 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{order.customer_name}</h3>
                    <p className="text-sm text-background/60">Order #{order.order_number}</p>
                    <p className="text-sm text-background/70">
                      {order.customer_email}
                    </p>
                    <p className="text-sm text-background/60">
                      {order.customer_phone || "No phone saved"}
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm text-background/60">
                      <span>{order.user_id ? "Account order" : "Guest order"}</span>
                      <span>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "Unknown date"}
                      </span>
                    </div>

                    {order.is_gift ? (
                      <span className="inline-block rounded-full border border-background/15 px-3 py-1 text-xs">
                        Gift Shipment
                      </span>
                    ) : null}
                  </div>

                  <div className="flex min-w-55 flex-col items-start gap-3">
                    <p className="text-lg font-semibold">
                      Total: {formatCurrency(order.total)}
                    </p>

                    <form action={changeOrderStatus} className="flex w-full gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="status"
                        defaultValue={normalizedStatus}
                        className="flex-1 rounded-xl border border-background/15 bg-sandstone px-3 py-2 text-background outline-none"
                      >
                        {statusOptions.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption.charAt(0).toUpperCase() +
                              statusOption.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl border border-background/15 px-4 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                      >
                        Update
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-background/15 bg-sandstone/60 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-background/55">
                      Shipping Address
                    </p>
                    <div className="mt-3 space-y-1 text-background/80">
                      {formatAddressLines(order.shipping_address).length ? (
                        formatAddressLines(order.shipping_address).map((line) => (
                          <p key={line}>{line}</p>
                        ))
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
                        formatAddressLines(order.billing_address).map((line) => (
                          <p key={line}>{line}</p>
                        ))
                      ) : (
                        <p>No billing address stored.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-background/10">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-background/10 text-left text-background/60">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items?.length ? (
                        order.order_items.map((item) => (
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
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-4 text-background/60" colSpan={4}>
                            No order items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-background/15 bg-background/10 p-5 text-background/70">
            No orders found.
          </div>
        )}
      </div>
    </section>
  );
}