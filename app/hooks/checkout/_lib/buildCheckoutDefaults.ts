"use client";

import type { User } from "@supabase/supabase-js";
import { formatPhoneNumber } from "@/lib/phone";
import {
  mapSavedAddressToCheckoutAddress,
  type CheckoutOrderForm,
  type SavedAddressRecord,
} from "@/lib/checkoutForm";

export function buildCheckoutDefaults(args: {
  user: User;
  profile: {
    display_name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  addresses: SavedAddressRecord[];
}): {
  savedAddresses: SavedAddressRecord[];
  selectedShippingAddressId: string;
  selectedBillingAddressId: string;
  form: CheckoutOrderForm;
} {
  const { user, profile, addresses } = args;

  const fallbackName =
    profile?.display_name ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "") ||
    "";

  const defaultShipping =
    addresses.find((address) => address.is_default_shipping) ?? addresses[0];

  const defaultBilling =
    addresses.find((address) => address.is_default_billing) ??
    defaultShipping ??
    null;

  const shippingAddress = defaultShipping
    ? mapSavedAddressToCheckoutAddress(defaultShipping)
    : {
        fullName: fallbackName,
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      };

  const billingAddress = defaultBilling
    ? mapSavedAddressToCheckoutAddress(defaultBilling)
    : shippingAddress;

  return {
    savedAddresses: addresses,
    selectedShippingAddressId: defaultShipping?.id ?? "",
    selectedBillingAddressId: defaultBilling?.id ?? "",
    form: {
      customerName: fallbackName,
      customerEmail: profile?.email || user.email || "",
      customerPhone: formatPhoneNumber(profile?.phone ?? ""),
      promoCode: "",
      isGift: false,
      shippingAddress,
      billingSameAsShipping: true,
      billingAddress,
    },
  };
}