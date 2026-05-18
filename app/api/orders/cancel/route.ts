import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseServerAuthed } from "@/lib/supabaseServerAuthed";
import { updateOrderStatus } from "@/lib/orders";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

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

function getSquareApiBaseUrl() {
  const env = (process.env.SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase();
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function toCents(amountDollars: number) {
  return Math.round(Number(amountDollars) * 100);
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getStringProp(
  obj: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!obj) return null;
  const value = obj[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumberProp(
  obj: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!obj) return null;
  const value = obj[key];

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
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

function base64UrlDecodeToString(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLen);
  return Buffer.from(padded, "base64").toString("utf8");
}

function signBase64Url(payloadB64: string, secret: string) {
  return createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function verifyCancelToken(token: string, secret: string): CancelTokenPayloadV1 | null {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = signBase64Url(payloadB64, secret);
  if (!safeEqual(expectedSig, sigB64)) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(base64UrlDecodeToString(payloadB64));
  } catch {
    return null;
  }

  const obj = asObject(payload);
  if (!obj) return null;

  const v = obj.v;
  const exp = obj.exp;
  const orderNumber = obj.orderNumber;
  const customerEmail = obj.customerEmail;
  const postalCode = obj.postalCode;

  if (v !== 1) return null;
  if (typeof exp !== "number" || !Number.isFinite(exp)) return null;
  if (typeof orderNumber !== "number" || !Number.isFinite(orderNumber) || orderNumber < 1) return null;
  if (typeof customerEmail !== "string" || !customerEmail.trim()) return null;
  if (typeof postalCode !== "string" || !postalCode.trim()) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec > exp) return null;

  return {
    v: 1,
    exp,
    orderNumber,
    customerEmail: customerEmail.trim(),
    postalCode: postalCode.trim(),
  };
}

async function createSquareRefund(args: {
  paymentId: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  reason?: string;
}) {
  const accessToken = getRequiredEnv("SQUARE_ACCESS_TOKEN");

  const response = await fetch(`${getSquareApiBaseUrl()}/v2/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: args.idempotencyKey,
      payment_id: args.paymentId,
      amount_money: { amount: args.amountCents, currency: args.currency },
      reason: args.reason,
    }),
  });

  const payload = await readJson(response);

  if (!response.ok) {
    return {
      ok: false as const,
      error: getSquareFirstError(payload) ?? "Square refund failed.",
    };
  }

  const obj = asObject(payload);
  const refundObj = asObject(obj?.refund);
  const refundId = getStringProp(refundObj, "id");

  return { ok: true as const, refundId };
}

function htmlPage(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; line-height: 1.4">
    ${bodyHtml}
  </body>
</html>`;
}

async function cancelByLookup(args: {
  userId: string | null;
  orderId: string | null;

  orderNumber: number | null;
  customerEmail: string | null;
  postalCode: string | null;
}) {
  const lookupById = Boolean(args.userId);

  if (lookupById && !args.orderId) {
    return { ok: false as const, status: 400, error: "Missing orderId." };
  }

  if (!lookupById) {
    if (!args.orderNumber || args.orderNumber < 1) {
      return { ok: false as const, status: 400, error: "Missing order number." };
    }
    if (!args.customerEmail) {
      return { ok: false as const, status: 400, error: "Missing customer email." };
    }
    if (!args.postalCode) {
      return { ok: false as const, status: 400, error: "Missing shipping postal code." };
    }
  }

  const { data: order, error } = lookupById
    ? await supabaseServer
        .from("orders")
        .select("id, user_id, status, total, square_payment_id")
        .eq("id", args.orderId as string)
        .maybeSingle()
    : await supabaseServer
        .from("orders")
        .select("id, user_id, status, total, square_payment_id")
        .eq("order_number", args.orderNumber as number)
        .ilike("customer_email", args.customerEmail as string)
        .eq("shipping_address->>postalCode", args.postalCode as string)
        .is("user_id", null)
        .maybeSingle();

  if (error || !order) {
    return { ok: false as const, status: 404, error: "Order not found." };
  }

  if (lookupById && order.user_id !== args.userId) {
    return { ok: false as const, status: 403, error: "Not authorized." };
  }

  const status = String(order.status ?? "").trim().toLowerCase();

  if (status === "shipped" || status === "completed") {
    return { ok: false as const, status: 409, error: "This order can no longer be cancelled." };
  }

  if (status === "cancelled") {
    return { ok: true as const, status: 200 };
  }

  if (status !== "paid" && status !== "processing") {
    return {
      ok: false as const,
      status: 409,
      error: "This order is not eligible for automatic refund.",
    };
  }

  const paymentId = typeof order.square_payment_id === "string" ? order.square_payment_id : "";
  if (!paymentId) {
    return {
      ok: false as const,
      status: 409,
      error: "Missing paymentId on order; cannot refund automatically.",
    };
  }

  const amountCents = toCents(Number(order.total ?? 0));
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    return { ok: false as const, status: 409, error: "Invalid order total." };
  }

  const refund = await createSquareRefund({
    paymentId,
    amountCents,
    currency: "USD",
    idempotencyKey: `${order.id}-refund`,
    reason: "Customer requested cancellation before shipping.",
  });

  if (!refund.ok) {
    return { ok: false as const, status: 402, error: refund.error };
  }

  await supabaseServer
    .from("orders")
    .update({
      square_refund_id: refund.refundId,
      refunded_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  await updateOrderStatus(order.id, "cancelled");

  return { ok: true as const, status: 200 };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  const secret = process.env.ORDER_CANCEL_TOKEN_SECRET;
  if (!secret) {
    return new Response(
      htmlPage(
        "Cancellation unavailable",
        `<h2>Cancellation link not configured.</h2><p>Please use the Orders page instead.</p>`,
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const payload = verifyCancelToken(token, secret);
  if (!payload) {
    return new Response(
      htmlPage(
        "Invalid link",
        `<h2>This cancellation link is invalid or expired.</h2><p>You can still cancel from the Orders page.</p>`,
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const result = await cancelByLookup({
    userId: null,
    orderId: null,
    orderNumber: payload.orderNumber,
    customerEmail: payload.customerEmail,
    postalCode: payload.postalCode,
  });

  if (!result.ok) {
    return new Response(
      htmlPage(
        "Unable to cancel",
        `<h2>Unable to cancel this order.</h2><p>${result.error ?? "Please try the Orders page."}</p>`,
      ),
      { status: result.status, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  return new Response(
    htmlPage(
      "Order cancelled",
      `<h2>Your order has been cancelled.</h2><p>If a refund was required, it has been submitted.</p>`,
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function POST(request: Request) {
  const supabaseAuthed = await supabaseServerAuthed();
  const {
    data: { session },
  } = await supabaseAuthed.auth.getSession();

  const userId = session?.user?.id ?? null;

  const body = await request.json().catch(() => null);
  const record = asObject(body);

  const orderId = getStringProp(record, "orderId");

  const orderNumber = getNumberProp(record, "orderNumber");
  const customerEmail = getStringProp(record, "customerEmail");
  const postalCode = getStringProp(record, "postalCode");

  const result = await cancelByLookup({
    userId,
    orderId: orderId ?? null,
    orderNumber,
    customerEmail,
    postalCode,
  });

  if (!result.ok) {
    return Response.json({ error: result.error ?? "Unable to cancel order." }, { status: result.status });
  }

  return Response.json({ ok: true }, { status: 200 });
}