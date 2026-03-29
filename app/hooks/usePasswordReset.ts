"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type VerifyResetTokenInput = {
  code?: string | null;
  tokenHash?: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function buildClientUrl(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  }

  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedSiteUrl}${normalizedPath}`;
}

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  async function runResetAction<T>(action: () => Promise<T>) {
    setLoading(true);
    setError(null);

    try {
      return await action();
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function sendResetEmail(email: string) {
    return runResetAction(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildClientUrl("/reset-password"),
      });

      if (error) {
        throw error;
      }
    });
  }

  async function verifyResetToken(input: VerifyResetTokenInput) {
    return runResetAction(async () => {
      if (input.code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          input.code
        );

        if (error) {
          throw error;
        }

        setIsVerified(true);
        return data.session;
      }

      if (input.tokenHash) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: input.tokenHash,
          type: "recovery",
        });

        if (error) {
          throw error;
        }

        setIsVerified(true);
        return data.session;
      }

      throw new Error("Missing password reset token.");
    });
  }

  async function updatePassword(newPassword: string) {
    return runResetAction(async () => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return data.user;
    });
  }

  function clearError() {
    setError(null);
  }

  return {
    sendResetEmail,
    verifyResetToken,
    updatePassword,
    loading,
    error,
    isVerified,
    clearError,
  };
}