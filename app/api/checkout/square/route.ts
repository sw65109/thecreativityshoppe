import { supabaseServerAuthed } from "@/lib/supabaseServerAuthed";
import { supabaseServer } from "@/lib/supabaseServer";
import { updateOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

type CreateOrderFunctionResult = {
  orderId: string;
  orderNumber: number;
  total: number;
  itemCount: number;
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
  return typeof value === "string" && value.trim() ? value : null;
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
    // ignore
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

  // Create the order via the existing Supabase Edge Function (centralized totals + promo rules)
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
    .select("customer_email")
    .eq("id", order.orderId)
    .maybeSingle();

  const orderRowObj = asObject(orderRow);
  const emailValue = orderRowObj?.customer_email;
  const buyerEmail = typeof emailValue === "string" ? emailValue : null;

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

  return Response.json({
    ok: true,
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    total: order.total,
    paymentId: squarePayment.paymentId,
    receiptUrl: squarePayment.receiptUrl,
  });
}