"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { formatPhoneNumber } from "@/lib/phone";
import { supabase } from "@/lib/supabaseClient";
import {
  createEmptyCheckoutForm,
  mapSavedAddressToCheckoutAddress,
  validateCheckoutForm,
} from "@/lib/checkoutForm";
import type {
  CheckoutOrderForm,
  SavedAddressRecord,
} from "@/lib/checkoutForm";
import type { CheckoutAddress } from "@/types/order";

type UseCheckoutFormArgs = {
  user: User | null;
  initialized: boolean;
  loading: boolean;
};

export function useCheckoutForm({
  user,
  initialized,
  loading,
}: UseCheckoutFormArgs) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressRecord[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState("");
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState("");
  const [form, setForm] = useState<CheckoutOrderForm>(createEmptyCheckoutForm());
  const [isLoadingCheckoutData, setIsLoadingCheckoutData] = useState(true);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCheckoutData() {
      if (!initialized || loading) {
        return;
      }

      if (!user) {
        if (!cancelled) {
          setSavedAddresses([]);
          setSelectedShippingAddressId("");
          setSelectedBillingAddressId("");
          setForm(createEmptyCheckoutForm());
          setIsLoadingCheckoutData(false);
        }

        return;
      }

      setIsLoadingCheckoutData(true);

      const [profileResult, addressesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, phone, email")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("addresses")
          .select(
            "id, label, full_name, line1, line2, city, state, postal_code, country, is_default_shipping, is_default_billing",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) {
        return;
      }

      const profile = profileResult.data;
      const addresses = (addressesResult.data ?? []) as SavedAddressRecord[];
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

      setSavedAddresses(addresses);
      setSelectedShippingAddressId(defaultShipping?.id ?? "");
      setSelectedBillingAddressId(defaultBilling?.id ?? "");
      setForm({
        customerName: fallbackName,
        customerEmail: profile?.email || user.email || "",
        customerPhone: formatPhoneNumber(profile?.phone ?? ""),
        isGift: false,
        shippingAddress,
        billingSameAsShipping: true,
        billingAddress,
      });
      setValidationMessage(null);
      setIsLoadingCheckoutData(false);
    }

    void loadCheckoutData();

    return () => {
      cancelled = true;
    };
  }, [initialized, loading, user]);

  function updateTopLevelField<K extends keyof CheckoutOrderForm>(
    field: K,
    value: CheckoutOrderForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateShippingField(field: keyof CheckoutAddress, value: string) {
    setForm((current) => ({
      ...current,
      shippingAddress: {
        ...current.shippingAddress,
        [field]: value,
      },
    }));
  }

  function updateBillingField(field: keyof CheckoutAddress, value: string) {
    setForm((current) => ({
      ...current,
      billingAddress: {
        ...current.billingAddress,
        [field]: value,
      },
    }));
  }

  function selectShippingAddress(id: string) {
    setSelectedShippingAddressId(id);

    const selectedAddress = savedAddresses.find((address) => address.id === id);

    if (!selectedAddress) {
      return;
    }

    setForm((current) => ({
      ...current,
      shippingAddress: mapSavedAddressToCheckoutAddress(selectedAddress),
    }));
  }

  function selectBillingAddress(id: string) {
    setSelectedBillingAddressId(id);

    const selectedAddress = savedAddresses.find((address) => address.id === id);

    if (!selectedAddress) {
      return;
    }

    setForm((current) => ({
      ...current,
      billingAddress: mapSavedAddressToCheckoutAddress(selectedAddress),
    }));
  }

  function validate() {
    const message = validateCheckoutForm(form);
    setValidationMessage(message);
    return message;
  }

  function resetGuestForm() {
    setSavedAddresses([]);
    setSelectedShippingAddressId("");
    setSelectedBillingAddressId("");
    setForm(createEmptyCheckoutForm());
    setValidationMessage(null);
  }

  return {
    form,
    savedAddresses,
    selectedShippingAddressId,
    selectedBillingAddressId,
    isLoadingCheckoutData,
    validationMessage,
    setForm,
    updateTopLevelField,
    updateShippingField,
    updateBillingField,
    selectShippingAddress,
    selectBillingAddress,
    validate,
    resetGuestForm,
  };
}