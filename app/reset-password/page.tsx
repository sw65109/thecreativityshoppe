"use client";

import { Suspense, useEffect, useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePasswordReset } from "@/app/hooks/usePasswordReset";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();

  const { verifyResetToken, updatePassword, loading, error, isVerified, clearError } =
    usePasswordReset();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>("Verifying reset link...");

  const tokenInput = useMemo(() => {
    const code = params.get("code");
    const tokenHash = params.get("token_hash");
    return { code, tokenHash };
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      clearError();
      setMessage("Verifying reset link...");

      try {
        await verifyResetToken(tokenInput);
        if (cancelled) return;
        setMessage(null);
      } catch (e) {
        if (cancelled) return;
        setMessage(e instanceof Error ? e.message : "Could not verify reset link.");
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [clearError, tokenInput, verifyResetToken]);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await updatePassword(newPassword);
      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => router.replace("/login"), 800);
    } catch {
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sandstone text-sandstone px-6">
      <div className="bg-background p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-center">Set New Password</h1>

        {message ? <p className="text-sandstone text-center">{message}</p> : null}
        {error ? <p className="text-red-500 text-center">{error}</p> : null}

        {!isVerified ? (
          <div className="text-center">
            <Link href="/forgot-password" className="text-red-500 text-lg font-bold underline">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="New password"
              className="px-4 py-3 rounded-lg bg-sandstone/80 outline-none text-background"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              className="px-4 py-3 rounded-lg bg-sandstone/80 outline-none text-background"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-sandstone text-background py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <p className="text-center">
              <Link href="/login" className="text-red-500 text-lg font-bold underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sandstone text-sandstone px-6">
          Verifying reset link...
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}