"use client";

import {
  formatAddressPreview,
  type SavedAddressRecord,
} from "@/lib/checkoutForm";
import type { CheckoutAddress } from "@/types/order";

type SavedAddressPickerProps = {
  label: string;
  selectedId: string;
  addresses: SavedAddressRecord[];
  previewAddress: CheckoutAddress | null;
  onSelect: (id: string) => void;
};

export default function SavedAddressPicker({
  label,
  selectedId,
  addresses,
  previewAddress,
  onSelect,
}: SavedAddressPickerProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <select
        value={selectedId}
        onChange={(event) => onSelect(event.target.value)}
        className="w-full rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
      >
        <option value="">Choose a saved address</option>
        {addresses.map((address) => (
          <option key={address.id} value={address.id}>
            {address.label || address.full_name}
          </option>
        ))}
      </select>

      {selectedId && previewAddress ? (
        <div className="mt-3 rounded-2xl border border-walnut/15 bg-sandstone/50 p-4 text-sm text-walnut/80">
          {formatAddressPreview(previewAddress).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}