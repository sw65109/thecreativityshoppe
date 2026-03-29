import type { CheckoutAddress } from "@/types/order";

export type SavedAddressRecord = {
  id: string;
  label: string | null;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
};

export type CheckoutOrderForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isGift: boolean;
  shippingAddress: CheckoutAddress;
  billingSameAsShipping: boolean;
  billingAddress: CheckoutAddress;
};

export function createEmptyAddress(): CheckoutAddress {
  return {
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  };
}

export function createEmptyCheckoutForm(): CheckoutOrderForm {
  return {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    isGift: false,
    shippingAddress: createEmptyAddress(),
    billingSameAsShipping: true,
    billingAddress: createEmptyAddress(),
  };
}

export function mapSavedAddressToCheckoutAddress(
  address: SavedAddressRecord,
): CheckoutAddress {
  return {
    fullName: address.full_name,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
  };
}

export function addressIsComplete(address: CheckoutAddress) {
  return Boolean(
    address.fullName.trim() &&
      address.line1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.postalCode.trim() &&
      address.country.trim(),
  );
}

export function formatAddressPreview(address: CheckoutAddress) {
  return [
    address.fullName,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`.trim(),
    address.country,
  ].filter(Boolean);
}

export function validateCheckoutForm(form: CheckoutOrderForm) {
  if (!form.customerName.trim()) {
    return "Customer name is required.";
  }

  if (!form.customerEmail.trim()) {
    return "Customer email is required.";
  }

  if (!/\S+@\S+\.\S+/.test(form.customerEmail.trim())) {
    return "Enter a valid email address.";
  }

  if (!addressIsComplete(form.shippingAddress)) {
    return "Complete the shipping address before placing the order.";
  }

  if (!form.billingSameAsShipping && !addressIsComplete(form.billingAddress)) {
    return "Complete the billing address or use the shipping address.";
  }

  return null;
}