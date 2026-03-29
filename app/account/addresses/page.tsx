"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useAccountAddresses } from "@/app/hooks/useAccountAddress";

export default function AccountAddressesPage() {
  const { user, initialized, loading } = useAuth();
  const {
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
  } = useAccountAddresses({
    user,
    initialized,
  });

  if (!initialized || loading || isPageLoading) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
        Loading addresses...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/75">
        Sign in to manage addresses.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-background">
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <h2 className="text-2xl font-semibold">
          {form.id ? "Edit Address" : "Add Address"}
        </h2>

        <p className="mt-2 text-background/65">
          Contact phone is managed once in your profile and used everywhere
          else.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            value={form.label}
            onChange={(event) =>
              setForm((current) => ({ ...current, label: event.target.value }))
            }
            placeholder="Label (Home, Studio, Office)"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
          />

          <input
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            placeholder="Full name"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <input
            value={form.country}
            onChange={(event) =>
              setForm((current) => ({ ...current, country: event.target.value }))
            }
            placeholder="Country"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <input
            value={form.line1}
            onChange={(event) =>
              setForm((current) => ({ ...current, line1: event.target.value }))
            }
            placeholder="Address line 1"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none md:col-span-2"
            required
          />

          <input
            value={form.line2}
            onChange={(event) =>
              setForm((current) => ({ ...current, line2: event.target.value }))
            }
            placeholder="Address line 2"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none md:col-span-2"
          />

          <input
            value={form.city}
            onChange={(event) =>
              setForm((current) => ({ ...current, city: event.target.value }))
            }
            placeholder="City"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <input
            value={form.state}
            onChange={(event) =>
              setForm((current) => ({ ...current, state: event.target.value }))
            }
            placeholder="State"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <input
            value={form.postalCode}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                postalCode: event.target.value,
              }))
            }
            placeholder="Postal code"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : form.id ? "Update Address" : "Add Address"}
            </button>

            {form.id ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-background/15 px-5 py-3 transition hover:bg-background hover:text-sandstone"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        {message ? (
          <p className="mt-4 text-sm text-background/80">{message}</p>
        ) : null}
      </div>

      <div className="grid gap-4">
        {addresses.length ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-3xl border border-background/20 bg-background/10 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {address.label || "Saved Address"}
                    </h3>

                    {address.is_default_shipping ? (
                      <span className="rounded-full border border-background/15 px-3 py-1 text-xs">
                        Default Shipping
                      </span>
                    ) : null}

                    {address.is_default_billing ? (
                      <span className="rounded-full border border-background/15 px-3 py-1 text-xs">
                        Default Billing
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2">{address.full_name}</p>
                  <p className="text-background/75">{address.line1}</p>
                  {address.line2 ? (
                    <p className="text-background/75">{address.line2}</p>
                  ) : null}
                  <p className="text-background/75">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-background/75">{address.country}</p>
                </div>

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    className="rounded-xl border border-background/15 px-4 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void setDefaultAddress("shipping", address.id)}
                    className="rounded-xl border border-background/15 px-4 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                  >
                    Set Default Shipping
                  </button>

                  <button
                    type="button"
                    onClick={() => void setDefaultAddress("billing", address.id)}
                    className="rounded-xl border border-background/15 px-4 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                  >
                    Set Default Billing
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(address.id)}
                    className="rounded-xl border border-background/15 px-4 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
            No saved addresses yet.
          </div>
        )}
      </div>
    </div>
  );
}