"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import CheckoutAddressFields from "@/app/components/checkout/CheckoutAddressFields";
import SavedAddressPicker from "@/app/components/checkout/SavedAddressPicker";
import type { CheckoutOrderForm, SavedAddressRecord } from "@/lib/checkoutForm";
import { formatPhoneNumber } from "@/lib/phone";
import type { CheckoutAddress } from "@/types/order";

type TopLevelFieldUpdater = <K extends keyof CheckoutOrderForm>(
  field: K,
  value: CheckoutOrderForm[K],
) => void;

type CheckoutFormProps = {
  user: User | null;
  form: CheckoutOrderForm;
  savedAddresses: SavedAddressRecord[];
  selectedShippingAddressId: string;
  selectedBillingAddressId: string;
  validationMessage: string | null;
  isCheckingOut: boolean;
  onTopLevelChange: TopLevelFieldUpdater;
  onShippingChange: (field: keyof CheckoutAddress, value: string) => void;
  onBillingChange: (field: keyof CheckoutAddress, value: string) => void;
  onSelectShippingAddress: (id: string) => void;
  onSelectBillingAddress: (id: string) => void;
  onSubmit: () => void;
};

export default function CheckoutForm({
  user,
  form,
  savedAddresses,
  selectedShippingAddressId,
  selectedBillingAddressId,
  validationMessage,
  isCheckingOut,
  onTopLevelChange,
  onShippingChange,
  onBillingChange,
  onSelectShippingAddress,
  onSelectBillingAddress,
  onSubmit,
}: CheckoutFormProps) {
  const hasSavedAddresses = Boolean(user && savedAddresses.length);
  const shippingTitle = form.isGift
    ? "Gift Recipient Shipping"
    : "Shipping Address";

  return (
    <div className="space-y-6">
      <section className="rounded-4xl bg-driftwood p-6 text-walnut">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-semibold">Customer Contact</h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <input
            type="text"
            value={form.customerName}
            onChange={(event) =>
              onTopLevelChange("customerName", event.target.value)
            }
            placeholder="Purchaser full name"
            autoComplete="name"
            className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
            required
          />

          <input
            type="email"
            value={form.customerEmail}
            onChange={(event) =>
              onTopLevelChange("customerEmail", event.target.value)
            }
            placeholder="Purchaser email"
            autoComplete="email"
            className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
            required
          />

          <input
            type="tel"
            value={form.customerPhone}
            onChange={(event) =>
              onTopLevelChange(
                "customerPhone",
                formatPhoneNumber(event.target.value),
              )
            }
            placeholder="Purchaser phone"
            autoComplete="tel"
            className="rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3 outline-none"
          />
        </div>
      </section>

      {hasSavedAddresses ? (
        <section className="rounded-4xl bg-driftwood p-6 text-walnut">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-semibold">Saved Address</h3>

            <label className="flex flex-col items-start text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isGift}
                onChange={(event) =>
                  onTopLevelChange("isGift", event.target.checked)
                }
                className="mb-1"
              />
              <span>This order is a gift</span>
            </label>
          </div>

          <div className="mt-6 grid gap-5">
            <SavedAddressPicker
              label="Saved shipping address"
              selectedId={selectedShippingAddressId}
              addresses={savedAddresses}
              previewAddress={form.shippingAddress}
              onSelect={onSelectShippingAddress}
            />

            {!form.billingSameAsShipping ? (
              <SavedAddressPicker
                label="Saved billing address"
                selectedId={selectedBillingAddressId}
                addresses={savedAddresses}
                previewAddress={form.billingAddress}
                onSelect={onSelectBillingAddress}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-4xl bg-driftwood p-6 text-walnut">
        <div className="max-w-2xl">
          <h3 className="text-2xl font-semibold">{shippingTitle}</h3>
        </div>

        <div className="mt-6">
          <CheckoutAddressFields
            title={shippingTitle}
            value={form.shippingAddress}
            onChange={onShippingChange}
          />
        </div>
      </section>

      <section className="rounded-4xl bg-driftwood p-6 text-walnut">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-semibold">Billing Address</h3>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.billingSameAsShipping}
              onChange={(event) =>
                onTopLevelChange("billingSameAsShipping", event.target.checked)
              }
            />
            Same as shipping
          </label>
        </div>

        {!form.billingSameAsShipping ? (
          <div className="mt-6">
            <CheckoutAddressFields
              title="Billing Address"
              value={form.billingAddress}
              onChange={onBillingChange}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-walnut/15 bg-sandstone/55 p-4 text-sm text-walnut/75">
            Same as shipping address
          </div>
        )}
      </section>

      <section className="rounded-4xl border border-walnut/15 bg-driftwood p-6 text-walnut">
        {validationMessage ? (
          <div className="mt-5 rounded-2xl border border-red-700/20 bg-red-100 px-4 py-3 text-sm text-red-800">
            {validationMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isCheckingOut}
            className="rounded-full bg-background px-8 py-3 font-semibold text-sandstone transition hover:opacity-90 disabled:opacity-60"
          >
            {isCheckingOut ? "Placing Order..." : "Place Order"}
          </button>

          <Link
            href="/cart"
            className="rounded-full border border-walnut/20 px-8 py-3 text-center font-semibold transition hover:bg-walnut hover:text-sandstone"
          >
            Back To Cart
          </Link>
        </div>
      </section>
    </div>
  );
}
