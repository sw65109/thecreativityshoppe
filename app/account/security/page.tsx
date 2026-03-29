"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useAccountSecurity } from "@/app/hooks/useAccountSecurity";

export default function AccountSecurityPage() {
  const { user, initialized, loading } = useAuth();
  const security = useAccountSecurity({ user });

  if (!initialized || loading) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
        Loading security settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/75">
        Sign in to manage your security settings.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-background">
      <section className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <h2 className="text-2xl font-semibold">Change Email</h2>
        <p className="mt-2 text-background/65">
          Email changes should always be verified before taking effect.
        </p>

        <form onSubmit={security.handleEmailSubmit} className="mt-6 grid gap-4">
          <input
            type="email"
            value={security.newEmail}
            onChange={(event) => security.setNewEmail(event.target.value)}
            placeholder="New email"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <button
            type="submit"
            disabled={security.isUpdatingEmail}
            className="w-fit rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90 disabled:opacity-60"
          >
            {security.isUpdatingEmail ? "Updating..." : "Update Email"}
          </button>
        </form>

        {security.emailMessage ? (
          <p className="mt-4 text-sm text-background/80">
            {security.emailMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <h2 className="text-2xl font-semibold">Change Password</h2>
        <p className="mt-2 text-background/65">
          Use a strong password that you do not reuse elsewhere.
        </p>

        <form onSubmit={security.handlePasswordSubmit} className="mt-6 grid gap-4">
          <input
            type="password"
            value={security.newPassword}
            onChange={(event) => security.setNewPassword(event.target.value)}
            placeholder="New password"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <input
            type="password"
            value={security.confirmPassword}
            onChange={(event) => security.setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            className="rounded-xl border border-background/15 bg-sandstone/60 px-4 py-3 outline-none"
            required
          />

          <button
            type="submit"
            disabled={security.isUpdatingPassword}
            className="w-fit rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90 disabled:opacity-60"
          >
            {security.isUpdatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>

        {security.passwordMessage ? (
          <p className="mt-4 text-sm text-background/80">
            {security.passwordMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-background/20 bg-background/10 p-6">
        <h2 className="text-2xl font-semibold">Future Security Options</h2>
        <p className="mt-3 text-background/70">
          This is the place to add OAuth provider management and 2FA later.
        </p>
      </section>
    </div>
  );
}