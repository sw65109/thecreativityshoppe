import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseServerAuthed } from "@/lib/supabaseServerAuthed";
import { updateOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

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

function getStringProp(obj: Record<string, unknown> | null, key: string): string | null {
  if (!obj) return null;
  const value = obj[key];
  return typeof value === "string" && value.trim() ? value : null;
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

export async function POST(request: Request) {
  const supabaseAuthed = await supabaseServerAuthed();
  const {
    data: { session },
  } = await supabaseAuthed.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "You must be signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId =
    body && typeof body === "object" && "orderId" in body
      ? String((body as Record<string, unknown>).orderId ?? "").trim()
      : "";

  if (!orderId) {
    return Response.json({ error: "Missing orderId." }, { status: 400 });
  }

  const { data: order, error } = await supabaseServer
    .from("orders")
    .select("id, user_id, status, total, square_payment_id")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.user_id !== userId) {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }

  const status = String(order.status ?? "").trim().toLowerCase();

  if (status === "shipped" || status === "completed") {
    return Response.json(
      { error: "This order can no longer be cancelled." },
      { status: 409 },
    );
  }

  if (status === "cancelled") {
    return Response.json({ ok: true }, { status: 200 });
  }

  if (status !== "paid" && status !== "processing") {
    return Response.json(
      { error: "This order is not eligible for automatic refund." },
      { status: 409 },
    );
  }

  const paymentId = typeof order.square_payment_id === "string" ? order.square_payment_id : "";
  if (!paymentId) {
    return Response.json(
      { error: "Missing paymentId on order; cannot refund automatically." },
      { status: 409 },
    );
  }

  const amountCents = toCents(Number(order.total ?? 0));
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    return Response.json({ error: "Invalid order total." }, { status: 409 });
  }

  const refund = await createSquareRefund({
    paymentId,
    amountCents,
    currency: "USD",
    idempotencyKey: `${orderId}-refund`,
    reason: "Customer requested cancellation before shipping.",
  });

  if (!refund.ok) {
    return Response.json({ error: refund.error }, { status: 402 });
  }

  await supabaseServer
    .from("orders")
    .update({
      square_refund_id: refund.refundId,
      refunded_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await updateOrderStatus(orderId, "cancelled");

  return Response.json({ ok: true });
}