"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

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

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAuthAction<T>(action: () => Promise<T>) {
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

  async function signUp(email: string, password: string) {
    return runAuthAction(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildClientUrl("/auth/confirm"),
        },
      });

      if (error) {
        throw error;
      }

      return data.user;
    });
  }

  async function signIn(email: string, password: string) {
    return runAuthAction(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("No user was returned from sign in.");
      }

      return data.user;
    });
  }

  async function signOut() {
    return runAuthAction(async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    });
  }

  async function sendEmailVerification(email: string) {
    return runAuthAction(async () => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: buildClientUrl("/auth/confirm"),
        },
      });

      if (error) {
        throw error;
      }
    });
  }

  async function updateEmail(email: string) {
    return runAuthAction(async () => {
      const { data, error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        throw error;
      }

      return data.user as User | null;
    });
  }

  async function updatePassword(password: string) {
    return runAuthAction(async () => {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return data.user as User | null;
    });
  }

  function clearError() {
    setError(null);
  }

  return {
    signUp,
    signIn,
    signOut,
    sendEmailVerification,
    updateEmail,
    updatePassword,
    loading,
    error,
    clearError,
  };
}