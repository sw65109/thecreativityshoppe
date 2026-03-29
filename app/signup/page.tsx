"use client";

import { SyntheticEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function SignupPage() {
  const { signup, resendConfirmation } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSignup(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signup(email, password);
      setVerificationEmail(email);
      setPassword("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    setResending(true);

    try {
      await resendConfirmation(verificationEmail);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not resend the verification email."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sandstone text-sandstone px-6">
      <form
        onSubmit={handleSignup}
        className="bg-background p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-3xl font-semibold text-center">Create Account</h1>

        {error ? <p className="text-red-500 text-center">{error}</p> : null}

        {verificationEmail ? (
          <div className="rounded-lg bg-white/10 p-4 text-sm text-center">
            <p>
              Check your email at <strong>{verificationEmail}</strong> to confirm
              your account.
            </p>

            <button
              type="button"
              onClick={() => void handleResendVerification()}
              disabled={resending}
              className="mt-4 text-red-500 font-bold underline disabled:opacity-60"
            >
              {resending ? "Resending..." : "Resend verification email"}
            </button>
          </div>
        ) : null}

        <input
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-lg bg-sandstone/80 outline-none text-background"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-lg bg-sandstone/80 outline-none text-background"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-sandstone text-background py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-red-500 text-lg font-bold underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}