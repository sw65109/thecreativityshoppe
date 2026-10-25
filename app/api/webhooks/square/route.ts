import { createHmac, timingSafeEqual } from "crypto";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

function isValidSignature(rawBody: string, signature: string | null) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL;
  if (!key || !url || !signature) return false;

  const expected = createHmac("sha256", key)
    .update(url + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!isValidSignature(rawBody, req.headers.get("x-square-hmacsha256-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { data?: { object?: { payment?: { id?: string; status?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const payment = event.data?.object?.payment;
  if (!payment?.id || payment.status !== "COMPLETED") {
    return new Response("ok");
  }

  const { error } = await supabaseServer
    .from("orders")
    .update({ status: "paid" })
    .eq("square_payment_id", payment.id)
    .eq("status", "pending");

  if (error) {
    console.error("Square webhook update failed:", error);
    return new Response("Server error", { status: 500 });
  }

  return new Response("ok");
}