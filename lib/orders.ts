import { supabaseServer } from "@/lib/supabaseServer";
import type {
  CheckoutAddress,
  CreateOrderInput,
  CreateOrderItemInput,
  OrderStatus,
} from "@/types/order";

function toMoneyNumber(value: number) {
  return Number(value.toFixed(2));
}

function buildOrderItemRow(orderId: string, item: CreateOrderItemInput) {
  const quantity = Number(item.quantity);
  const productPrice = Number(item.productPrice);
  const lineTotal = toMoneyNumber(productPrice * quantity);

  return {
    order_id: orderId,
    product_id: item.productId,
    product_name: item.productName,
    product_price: productPrice,
    quantity,
    line_total: lineTotal,
  };
}

function normalizeAddress(address: CheckoutAddress) {
  return {
    fullName: address.fullName.trim(),
    line1: address.line1.trim(),
    line2: address.line2.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim() || "US",
  };
}

function requireAddress(address: CheckoutAddress | null | undefined, label: string) {
  if (!address) {
    throw new Error(`${label} address is required.`);
  }

  const normalized = normalizeAddress(address);

  if (
    !normalized.fullName ||
    !normalized.line1 ||
    !normalized.city ||
    !normalized.state ||
    !normalized.postalCode ||
    !normalized.country
  ) {
    throw new Error(`${label} address is required.`);
  }

  return normalized;
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.customerName.trim()) {
    throw new Error("Customer name is required.");
  }

  if (!input.customerEmail.trim()) {
    throw new Error("Customer email is required.");
  }

  if (!input.items.length) {
    throw new Error("At least one order item is required.");
  }

  const shippingAddress = requireAddress(input.shippingAddress, "Shipping");
  const billingAddress = input.billingAddress
    ? requireAddress(input.billingAddress, "Billing")
    : shippingAddress;

  const total = toMoneyNumber(
    input.items.reduce((sum, item) => {
      return sum + Number(item.productPrice) * Number(item.quantity);
    }, 0),
  );

  const { data: order, error: orderError } = await supabaseServer
    .from("orders")
    .insert({
      user_id: input.userId ?? null,
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim(),
      customer_phone: input.customerPhone?.trim() || null,
      is_gift: Boolean(input.isGift),
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      status: input.status ?? "pending",
      total,
    })
    .select("id")
    .single();

  if (orderError) {
    throw new Error(orderError.message);
  }

  const itemRows = input.items.map((item) => buildOrderItemRow(order.id, item));

  const { error: itemsError } = await supabaseServer
    .from("order_items")
    .insert(itemRows);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return { orderId: order.id };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabaseServer
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}