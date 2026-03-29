"use client";

import { SyntheticEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export type AddressRecord = {
  id: string;
  user_id: string;
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
  created_at: string;
};

export type AddressForm = {
  id: string | null;
  label: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyForm: AddressForm = {
  id: null,
  label: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

type UseAccountAddressesArgs = {
  user: User | null;
  initialized: boolean;
};

export function useAccountAddresses({
  user,
  initialized,
}: UseAccountAddressesArgs) {
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAddresses() {
      if (!initialized) {
        return;
      }

      if (!user) {
        if (!cancelled) {
          setAddresses([]);
          setIsPageLoading(false);
        }
        return;
      }

      setIsPageLoading(true);

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (error) {
        setMessage(`Failed to load addresses: ${error.message}`);
        setAddresses([]);
      } else {
        setAddresses((data as AddressRecord[]) ?? []);
      }

      setIsPageLoading(false);
    }

    void fetchAddresses();

    return () => {
      cancelled = true;
    };
  }, [initialized, user]);

  async function refreshAddresses() {
    if (!user) {
      setAddresses([]);
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Failed to load addresses: ${error.message}`);
      setAddresses([]);
      return;
    }

    setAddresses((data as AddressRecord[]) ?? []);
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function startEdit(address: AddressRecord) {
    setForm({
      id: address.id,
      label: address.label ?? "",
      fullName: address.full_name,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
    });
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const basePayload = {
      label: form.label.trim() || null,
      full_name: form.fullName.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postalCode.trim(),
      country: form.country.trim() || "US",
    };

    const result = form.id
      ? await supabase
          .from("addresses")
          .update(basePayload)
          .eq("id", form.id)
          .eq("user_id", user.id)
      : await supabase.from("addresses").insert({
          ...basePayload,
          user_id: user.id,
        });

    if (result.error) {
      setMessage(`Failed to save address: ${result.error.message}`);
    } else {
      setMessage(form.id ? "Address updated." : "Address added.");
      resetForm();
      await refreshAddresses();
    }

    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    if (!user) {
      return;
    }

    setMessage(null);

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setMessage(`Failed to delete address: ${error.message}`);
    } else {
      setMessage("Address deleted.");
      await refreshAddresses();
    }
  }

  async function setDefaultAddress(
    type: "shipping" | "billing",
    addressId: string,
  ) {
    if (!user) {
      return;
    }

    setMessage(null);

    const field =
      type === "shipping" ? "is_default_shipping" : "is_default_billing";

    const clearResult = await supabase
      .from("addresses")
      .update({ [field]: false })
      .eq("user_id", user.id);

    if (clearResult.error) {
      setMessage(`Failed to update defaults: ${clearResult.error.message}`);
      return;
    }

    const setResult = await supabase
      .from("addresses")
      .update({ [field]: true })
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (setResult.error) {
      setMessage(`Failed to set default address: ${setResult.error.message}`);
      return;
    }

    setMessage(
      type === "shipping"
        ? "Default shipping address updated."
        : "Default billing address updated.",
    );

    await refreshAddresses();
  }

  return {
    addresses,
    form,
    isPageLoading,
    isSaving,
    message,
    setForm,
    resetForm,
    startEdit,
    handleSubmit,
    handleDelete,
    setDefaultAddress,
  };
}