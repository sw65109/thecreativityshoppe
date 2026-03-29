"use client";

export default function AccountPaymentsPage() {
  return (
    <div className="space-y-6 text-background">
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <h2 className="text-2xl font-semibold">Payment Methods</h2>
        <p className="mt-3 max-w-2xl text-background/70">
          Payment methods should be managed through Stripe Customer Portal, not
          directly inside your app. That keeps card handling PCI compliant and
          keeps your storefront out of card-storage scope.
        </p>

        <div className="mt-6 rounded-2xl border border-background/15 bg-sandstone/60 p-4">
          <p className="text-sm uppercase tracking-[0.2em] text-background/55">
            Recommended Setup
          </p>
          <p className="mt-2 text-background/80">
            Add a server endpoint that creates a Stripe Customer Portal session,
            then redirect the customer there from this page.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="mt-6 rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone opacity-60"
        >
          Manage Payment Methods
        </button>

        <p className="mt-3 text-sm text-background/60">
          Enable this button after Stripe is connected and your customer portal
          endpoint is in place.
        </p>
      </div>

      <div className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <h2 className="text-2xl font-semibold">What This Will Handle Later</h2>
        <div className="mt-4 grid gap-3 text-background/75">
          <p>Saved cards</p>
          <p>Billing details</p>
          <p>Subscriptions, if you add recurring products later</p>
        </div>
      </div>
    </div>
  );
}