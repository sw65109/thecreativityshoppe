"use client";

import { SyntheticEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sandstone text-sandstone px-6">
      <form
        onSubmit={handleLogin}
        className="bg-background p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-3xl font-semibold text-center">Login</h1>

        {error ? <p className="text-red-500 text-center">{error}</p> : null}

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
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-center">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-red-500 text-lg font-bold underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}