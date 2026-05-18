import { supabaseServerAuthed } from "@/lib/supabaseServerAuthed";
import { supabaseServer } from "@/lib/supabaseServer";
import { updateOrderStatus } from "@/lib/orders";
import { createHmac } from "crypto";

export const runtime = "nodejs";

type CreateOrderFunctionResult = {
  orderId: string;
  orderNumber: number;
  total: number;
  itemCount: number;
};

type CancelTokenPayloadV1 = {
  v: 1;
  exp: number;
  orderNumber: number;
  customerEmail: string;
  postalCode: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Server is missing ${name}.`);
  return value;
}

function getSupabaseFunctionUrl(name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  return `${baseUrl}/functions/v1/${name}`;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getStringProp(obj: Record<string, unknown> | null, key: string): string | null {
  if (!obj) return null;
  const value = obj[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function parseErrorResponse(response: Response) {
  const payload = await readJson(response);
  const obj = asObject(payload);

  const error = getStringProp(obj, "error");
  if (error) return error;

  const message = getStringProp(obj, "message");
  if (message) return message;

  try {
    if (payload !== null && payload !== undefined) return JSON.stringify(payload);
  } catch {
  }

  try {
    return await response.text();
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

function toCents(amountDollars: number) {
  return Math.round(Number(amountDollars) * 100);
}

function getSquareApiBaseUrl() {
  const env = (process.env.SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase();
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function getSquareFirstError(payload: unknown): string | null {
  const obj = asObject(payload);
  const errors = obj?.errors;

  if (!Array.isArray(errors) || errors.length === 0) return null;

  const first = asObject(errors[0]);
  const detail = getStringProp(first, "detail");
  if (detail) return detail;

  const code = getStringProp(first, "code");
  if (code) return code;

  return null;
}

function getPublicBaseUrl(request: Request) {
  const explicit = process.env.PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.trim()) return explicit.replace(/\/+$/, "");

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  return new URL(request.url).origin;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signBase64Url(payloadB64: string, secret: string) {
  return createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createCancelToken(payload: CancelTokenPayloadV1, secret: string) {
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sigB64 = signBase64Url(payloadB64, secret);
  return `${payloadB64}.${sigB64}`;
}

async function sendOrderConfirmationEmail(args: {
  to: string;
  orderNumber: number;
  total: number;
  receiptUrl: string | null;
  ordersUrl: string;
  cancelUrl: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("Order email not configured (missing RESEND_API_KEY or ORDER_EMAIL_FROM).");
    return;
  }

  const subject = `Order #${args.orderNumber} confirmed`;

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.4">
      <h2 style="margin:0 0 12px 0">Thanks for your order!</h2>
      <p style="margin:0 0 8px 0"><strong>Order #:</strong> ${args.orderNumber}</p>
      <p style="margin:0 0 8px 0"><strong>Total:</strong> $${Number(args.total).toFixed(2)}</p>
      ${args.receiptUrl ? `<p style="margin:0 0 12px 0"><a href="${args.receiptUrl}">View Square receipt</a></p>` : ""}

      <hr style="margin:16px 0" />

      <h3 style="margin:0 0 8px 0">Cancel options</h3>

      ${
        args.cancelUrl
          ? `
            <p style="margin:0 0 8px 0">
              <a href="${args.cancelUrl}">Cancel this order now</a>
            </p>
            <p style="margin:0 0 12px 0; color:#555">
              (This link is personalized to your order.)
            </p>
          `
          : ""
      }

      <p style="margin:0 0 8px 0">
        View your order status anytime here:
        <a href="${args.ordersUrl}">${args.ordersUrl}</a>
      </p>

      <p style="margin:0; color:#555">
        If you checked out as a guest, you can also cancel from the Orders page using your order number, this email address, and your shipping ZIP/postal code.
      </p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: args.to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Failed to send order confirmation email:", res.status, text);
  }
}

function getSquarePaymentFields(payload: unknown): { paymentId: string | null; receiptUrl: string | null } {
  const obj = asObject(payload);
  const paymentObj = asObject(obj?.payment);

  const paymentId = getStringProp(paymentObj, "id");
  const receiptUrl = getStringProp(paymentObj, "receipt_url");

  return { paymentId, receiptUrl };
}

async function createSquarePayment(args: {
  sourceId: string;
  idempotencyKey: string;
  amountCents: number;
  currency: string;
  locationId: string;
  buyerEmail?: string | null;
  note?: string;
}) {
  const accessToken = getRequiredEnv("SQUARE_ACCESS_TOKEN");

  const response = await fetch(`${getSquareApiBaseUrl()}/v2/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_id: args.sourceId,
      idempotency_key: args.idempotencyKey,
      amount_money: { amount: args.amountCents, currency: args.currency },
      location_id: args.locationId,
      autocomplete: true,
      buyer_email_address: args.buyerEmail ?? undefined,
      note: args.note,
    }),
  });

  const payload = await readJson(response);

  if (!response.ok) {
    return {
      ok: false as const,
      error: getSquareFirstError(payload) ?? "Square payment failed.",
    };
  }

  const { paymentId, receiptUrl } = getSquarePaymentFields(payload);

  return {
    ok: true as const,
    paymentId,
    receiptUrl,
  };
}

export async function POST(request: Request) {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    return Response.json(
      { error: "Server is missing NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      { status: 500 },
    );
  }

  const locationId =
    process.env.SQUARE_LOCATION_ID ?? process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  if (!locationId) {
    return Response.json(
      { error: "Server is missing SQUARE_LOCATION_ID (or NEXT_PUBLIC_SQUARE_LOCATION_ID)." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record = asObject(body);
  if (!record) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sourceId = typeof record.sourceId === "string" ? record.sourceId.trim() : "";
  const checkout = record.checkout;

  if (!sourceId) {
    return Response.json({ error: "Missing Square sourceId." }, { status: 400 });
  }

  if (!asObject(checkout)) {
    return Response.json({ error: "Missing checkout payload." }, { status: 400 });
  }

  const supabaseAuthed = await supabaseServerAuthed();
  const {
    data: { session },
  } = await supabaseAuthed.auth.getSession();

  const headers: Record<string, string> = {
    apikey: anonKey,
    "Content-Type": "application/json",
  };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const orderResponse = await fetch(getSupabaseFunctionUrl("create-order"), {
    method: "POST",
    headers,
    body: JSON.stringify(checkout),
  });

  if (!orderResponse.ok) {
    return Response.json(
      { error: await parseErrorResponse(orderResponse) },
      { status: orderResponse.status },
    );
  }

  const order = (await readJson(orderResponse)) as CreateOrderFunctionResult;

  if (!order?.orderId || !Number.isFinite(order.total)) {
    return Response.json(
      { error: "Order function returned an invalid response." },
      { status: 502 },
    );
  }

  const amountCents = toCents(order.total);
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    await updateOrderStatus(order.orderId, "cancelled");
    return Response.json(
      { error: "Order total was invalid for payment." },
      { status: 400 },
    );
  }

  const { data: orderRow } = await supabaseServer
    .from("orders")
    .select("customer_email, shipping_address")
    .eq("id", order.orderId)
    .maybeSingle();

  const orderRowObj = asObject(orderRow);
  const emailValue = orderRowObj?.customer_email;
  const buyerEmail = typeof emailValue === "string" ? emailValue : null;

  const shippingObj = asObject(orderRowObj?.shipping_address ?? null);
  const postalCode = getStringProp(shippingObj, "postalCode");

  const squarePayment = await createSquarePayment({
    sourceId,
    idempotencyKey: order.orderId,
    amountCents,
    currency: "USD",
    locationId,
    buyerEmail,
    note: `Order #${order.orderNumber}`,
  });

  if (!squarePayment.ok) {
    await updateOrderStatus(order.orderId, "cancelled");
    return Response.json({ error: squarePayment.error }, { status: 402 });
  }

  const { error: paymentUpdateError } = await supabaseServer
    .from("orders")
    .update({
      square_payment_id: squarePayment.paymentId,
      square_receipt_url: squarePayment.receiptUrl,
    })
    .eq("id", order.orderId);

  if (paymentUpdateError) {
    console.error("Failed to store Square payment fields:", paymentUpdateError.message);
  }

  await updateOrderStatus(order.orderId, "paid");

  const baseUrl = getPublicBaseUrl(request);
  const ordersUrl = `${baseUrl}/orders`;

  let cancelUrl: string | null = null;
  const cancelSecret = process.env.ORDER_CANCEL_TOKEN_SECRET;

  if (cancelSecret && buyerEmail && postalCode) {
    const nowSec = Math.floor(Date.now() / 1000);
    const payload: CancelTokenPayloadV1 = {
      v: 1,
      exp: nowSec + 60 * 60 * 24 * 7,
      orderNumber: order.orderNumber,
      customerEmail: buyerEmail,
      postalCode,
    };

    const token = createCancelToken(payload, cancelSecret);
    cancelUrl = `${baseUrl}/api/orders/cancel?token=${encodeURIComponent(token)}`;
  }

  if (buyerEmail) {
    try {
      await sendOrderConfirmationEmail({
        to: buyerEmail,
        orderNumber: order.orderNumber,
        total: order.total,
        receiptUrl: squarePayment.receiptUrl,
        ordersUrl,
        cancelUrl,
      });
    } catch (error) {
      console.error("Order confirmation email failed:", error);
    }
  }

  return Response.json({
    ok: true,
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    total: order.total,
    paymentId: squarePayment.paymentId,
    receiptUrl: squarePayment.receiptUrl,
  });
}