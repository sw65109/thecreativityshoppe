"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { usePasswordReset } from "@/app/hooks/usePasswordReset";

export default function ForgotPasswordPage() {
  const { sendResetEmail, loading, error, clearError } = usePasswordReset();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();
    setMessage(null);

    try {
      await sendResetEmail(email.trim());
      setMessage("Check your email for a password reset link.");
      setEmail("");
    } catch {
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sandstone text-sandstone px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-background p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-3xl font-semibold text-center">Reset Password</h1>

        {error ? <p className="text-red-500 text-center">{error}</p> : null}
        {message ? <p className="text-sandstone text-center">{message}</p> : null}

        <input
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-lg bg-sandstone/80 outline-none text-background"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-sandstone text-background py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="text-center">
          Remembered your password?{" "}
          <Link href="/login" className="text-red-500 text-lg font-bold underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}