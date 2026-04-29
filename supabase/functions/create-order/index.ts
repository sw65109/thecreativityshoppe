/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAdminClient } from "../_shared/auth.ts";
import { buildCorsPreflightResponse } from "../_shared/cors.ts";
import { toMoneyNumber } from "../_shared/money.ts";
import { errorResponse, jsonResponse } from "../_shared/responses.ts";

type CheckoutAddress = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CreateOrderRequest = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  promoCode?: string;
  isGift?: boolean;
  shippingAddress?: unknown;
  billingAddress?: unknown;
  items: Array<{
    productId: string;
    quantity: number;
    variant?: string;
  }>;
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string | null;
};

type AuthenticatedUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown> | null;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("Authorization")?.trim() ?? "";

  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

function createUserClient() {
  return createClient(
    getRequiredEnv("PROJECT_URL"),
    getRequiredEnv("ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseAddress(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ok: false as const,
      response: errorResponse(`${label} address is required.`, 400),
    };
  }

  const record = value as Record<string, unknown>;

  const address: CheckoutAddress = {
    fullName: normalizeOptionalText(record.fullName) ?? "",
    line1: normalizeOptionalText(record.line1) ?? "",
    line2: normalizeOptionalText(record.line2) ?? "",
    city: normalizeOptionalText(record.city) ?? "",
    state: normalizeOptionalText(record.state) ?? "",
    postalCode: normalizeOptionalText(record.postalCode) ?? "",
    country: normalizeOptionalText(record.country) ?? "US",
  };

  if (
    !address.fullName ||
    !address.line1 ||
    !address.city ||
    !address.state ||
    !address.postalCode ||
    !address.country
  ) {
    return {
      ok: false as const,
      response: errorResponse(`${label} address is required.`, 400),
    };
  }

  return {
    ok: true as const,
    address,
  };
}

async function maybeAuthenticateUser(request: Request) {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      ok: true as const,
      user: null,
    };
  }

  const userClient = createUserClient();

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser(accessToken);

  if (error || !user) {
    return {
      ok: false as const,
      response: errorResponse(error?.message ?? "Unauthorized.", 401),
    };
  }

  return {
    ok: true as const,
    user: {
      id: user.id,
      email: user.email ?? null,
      user_metadata: user.user_metadata ?? null,
    } satisfies AuthenticatedUser,
  };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return buildCorsPreflightResponse();
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed.", 405);
  }

  const auth = await maybeAuthenticateUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const user = auth.user;
  const adminClient = createAdminClient();

  let payload: CreateOrderRequest;

  try {
    payload = (await request.json()) as CreateOrderRequest;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return errorResponse("At least one order item is required.", 400);
  }

  const invalidItem = payload.items.find(
    (item) =>
      !item ||
      typeof item.productId !== "string" ||
      !item.productId.trim() ||
      !Number.isFinite(item.quantity) ||
      item.quantity < 1,
  );

  if (invalidItem) {
    return errorResponse(
      "Each item must include a productId and quantity >= 1.",
      400,
    );
  }

  const shippingResult = parseAddress(payload.shippingAddress, "Shipping");

  if (!shippingResult.ok) {
    return shippingResult.response;
  }

  const billingResult = payload.billingAddress
    ? parseAddress(payload.billingAddress, "Billing")
    : null;

  if (billingResult && !billingResult.ok) {
    return billingResult.response;
  }

  const metadataFullName = user?.user_metadata?.["full_name"];
  const fallbackName =
    typeof metadataFullName === "string" && metadataFullName.trim()
      ? metadataFullName.trim()
      : null;

  const customerName = normalizeOptionalText(payload.customerName) ?? fallbackName;

  if (!customerName) {
    return errorResponse("Customer name is required.", 400);
  }

  const customerEmail =
    normalizeOptionalText(payload.customerEmail) ?? user?.email?.trim() ?? null;

  if (!customerEmail) {
    return errorResponse("Customer email is required.", 400);
  }

  const customerPhone = normalizeOptionalText(payload.customerPhone);
  const isGift = Boolean(payload.isGift);
  const shippingAddress = shippingResult.address;
  const billingAddress = billingResult?.address ?? shippingAddress;

  const requestedIds = [
    ...new Set(payload.items.map((item) => item.productId.trim())),
  ];

  const { data: products, error: productsError } = await adminClient
    .from("products")
    .select("id, name, price")
    .in("id", requestedIds);

  if (productsError) {
    return errorResponse(productsError.message, 500);
  }

  const productRows = (products ?? []) as ProductRow[];

  const productMap = new Map(
    productRows.map((product) => [
      product.id,
      {
        id: product.id,
        name: String(product.name ?? ""),
        price: Number(product.price ?? 0),
      },
    ]),
  );

  const missingProductId = requestedIds.find((id) => !productMap.has(id));

  if (missingProductId) {
    return errorResponse(`Product not found: ${missingProductId}`, 400);
  }

  const itemRows = payload.items.map((item) => {
    const product = productMap.get(item.productId.trim());

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const quantity = Number(item.quantity);
    const productPrice = Number(product.price);
    const lineTotal = toMoneyNumber(productPrice * quantity);

    const variant = normalizeOptionalText(item.variant);
    const productName = variant ? `${product.name} (${variant})` : product.name;

    return {
      product_id: product.id,
      product_name: productName,
      product_price: productPrice,
      quantity,
      line_total: lineTotal,
    };
  });

  const subtotal = toMoneyNumber(
    itemRows.reduce((sum, item) => sum + item.line_total, 0),
  );

  const normalizedPromoCode =
    normalizeOptionalText(payload.promoCode)?.toUpperCase() ?? null;

  const allowedPromoCodes = new Set(["2026"]);

  let discountTotal = 0;

  if (normalizedPromoCode) {
    if (!allowedPromoCodes.has(normalizedPromoCode)) {
      return errorResponse("Invalid promo code.", 400);
    }

    if (subtotal < 50) {
      return errorResponse("Promo code requires a $50+ subtotal.", 400);
    }

    discountTotal = toMoneyNumber(subtotal * 0.1);
  }

  const total = toMoneyNumber(subtotal - discountTotal);

  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      is_gift: isGift,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      promo_code: normalizedPromoCode,
      subtotal,
      discount_total: discountTotal,
      status: "pending",
      total,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return errorResponse(orderError?.message ?? "Failed to create order.", 500);
  }

  const orderItemsPayload = itemRows.map((item) => ({
    order_id: order.id,
    ...item,
  }));

  const { error: itemsError } = await adminClient
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) {
    await adminClient.from("orders").delete().eq("id", order.id);
    return errorResponse(itemsError.message, 500);
  }

  return jsonResponse({
    orderId: order.id,
    orderNumber: order.order_number,
    total,
    itemCount: itemRows.reduce((sum, item) => sum + item.quantity, 0),
  });
});