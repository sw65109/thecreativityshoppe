"use client";

import type { CheckoutAddress } from "@/types/order";

type CheckoutAddressFieldsProps = {
  title: string;
  value: CheckoutAddress;
  onChange: (field: keyof CheckoutAddress, value: string) => void;
};

export default function CheckoutAddressFields({
  title,
  value,
  onChange,
}: CheckoutAddressFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      <div className="grid gap-4">
        <input
          type="text"
          value={value.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          placeholder="Full name"
          autoComplete="name"
          className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
          required
        />

        <input
          type="text"
          value={value.line1}
          onChange={(event) => onChange("line1", event.target.value)}
          placeholder="Address line 1"
          autoComplete="address-line1"
          className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
          required
        />

        <input
          type="text"
          value={value.line2}
          onChange={(event) => onChange("line2", event.target.value)}
          placeholder="Address line 2"
          autoComplete="address-line2"
          className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={value.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder="City"
            autoComplete="address-level2"
            className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
            required
          />

          <input
            type="text"
            value={value.state}
            onChange={(event) => onChange("state", event.target.value)}
            placeholder="State"
            autoComplete="address-level1"
            className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={value.postalCode}
            onChange={(event) => onChange("postalCode", event.target.value)}
            placeholder="Postal code"
            autoComplete="postal-code"
            className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
            required
          />

          <input
            type="text"
            value={value.country}
            onChange={(event) => onChange("country", event.target.value)}
            placeholder="Country"
            autoComplete="country-name"
            className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
            required
          />
        </div>
      </div>
    </div>
  );
}