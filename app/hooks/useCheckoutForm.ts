"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createEmptyCheckoutForm, validateCheckoutForm } from "@/lib/checkoutForm";
import type { CheckoutOrderForm, SavedAddressRecord } from "@/lib/checkoutForm";
import type { CheckoutAddress } from "@/types/order";
import { loadCheckoutData } from "@/app/hooks/checkout/_lib/loadCheckoutData";
import { buildCheckoutDefaults } from "@/app/hooks/checkout/_lib/buildCheckoutDefaults";
import { mapSavedAddressToCheckoutAddress } from "@/lib/checkoutForm";

type UseCheckoutFormArgs = {
  user: User | null;
  initialized: boolean;
  loading: boolean;
};

export function useCheckoutForm({ user, initialized, loading }: UseCheckoutFormArgs) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressRecord[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState("");
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState("");
  const [form, setForm] = useState<CheckoutOrderForm>(createEmptyCheckoutForm());
  const [isLoadingCheckoutData, setIsLoadingCheckoutData] = useState(true);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
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

      const { profile, addresses } = await loadCheckoutData(user.id);

      if (cancelled) {
        return;
      }

      const defaults = buildCheckoutDefaults({
        user,
        profile,
        addresses,
      });

      setSavedAddresses(defaults.savedAddresses);
      setSelectedShippingAddressId(defaults.selectedShippingAddressId);
      setSelectedBillingAddressId(defaults.selectedBillingAddressId);
      setForm(defaults.form);
      setValidationMessage(null);
      setIsLoadingCheckoutData(false);
    }

    void hydrate();

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
    if (!selectedAddress) return;

    setForm((current) => ({
      ...current,
      shippingAddress: mapSavedAddressToCheckoutAddress(selectedAddress),
    }));
  }

  function selectBillingAddress(id: string) {
    setSelectedBillingAddressId(id);

    const selectedAddress = savedAddresses.find((address) => address.id === id);
    if (!selectedAddress) return;

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