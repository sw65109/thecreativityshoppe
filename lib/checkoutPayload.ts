import type { CartItem } from "@/app/context/CartContext";
import { digitsOnlyPhone } from "@/lib/phone";
import type { CreateOrderFunctionInput } from "@/types/order";
import type { CheckoutOrderForm } from "@/lib/checkoutForm";

function normalizeAddress(address: CheckoutOrderForm["shippingAddress"]) {
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

export function buildCheckoutPayload(
  items: CartItem[],
  form: CheckoutOrderForm,
): CreateOrderFunctionInput {
  const shippingAddress = normalizeAddress(form.shippingAddress);
  const billingAddress = form.billingSameAsShipping
    ? shippingAddress
    : normalizeAddress(form.billingAddress);

  return {
    customerName: form.customerName.trim(),
    customerEmail: form.customerEmail.trim(),
    customerPhone: digitsOnlyPhone(form.customerPhone) || undefined,
    isGift: form.isGift,
    shippingAddress,
    billingAddress,
    items: items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
  };
}