"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole, type UserRole } from "@/lib/profiles";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading the session.";
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrateSession(nextSession: Session | null) {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setError(null);

      if (!nextSession?.user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextRole = await getUserRole(nextSession.user.id);

        if (!active) {
          return;
        }

        setRole(nextRole);
      } catch (error) {
        if (!active) {
          return;
        }

        setRole(null);
        setError(getErrorMessage(error));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    async function loadInitialSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setError(getErrorMessage(error));
        setIsLoading(false);
        return;
      }

      await hydrateSession(data.session ?? null);
    }

    void loadInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void hydrateSession(nextSession);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    role,
    isAdmin: role === "admin",
    isAuthenticated: Boolean(user),
    isLoading,
    error,
  };
}