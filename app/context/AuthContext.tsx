"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole, type UserRole } from "@/lib/profiles";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  async function syncAuthState(
    nextUser: User | null,
    options?: { showLoading?: boolean; markInitialized?: boolean }
  ) {
    const showLoading = options?.showLoading ?? true;
    const markInitialized = options?.markInitialized ?? false;

    if (showLoading) {
      setLoading(true);
    }

    setUser(nextUser);

    if (!nextUser) {
      setRole(null);
      setLoading(false);

      if (markInitialized) {
        setInitialized(true);
      }

      return;
    }

    try {
      const nextRole = await getUserRole(nextUser.id);
      setRole(nextRole);
    } catch (error) {
      console.error("Failed to load profile role:", error);
      setRole("customer");
    } finally {
      setLoading(false);

      if (markInitialized) {
        setInitialized(true);
      }
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialSession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      void syncAuthState(data.session?.user ?? null, {
        showLoading: true,
        markInitialized: true,
      });
    }

    async function refreshSessionFromVisibility() {
      if (!mounted || document.visibilityState !== "visible") {
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      void syncAuthState(data.session?.user ?? null, {
        showLoading: false,
        markInitialized: false,
      });
    }

    void loadInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      window.setTimeout(() => {
        if (!mounted) {
          return;
        }

        void syncAuthState(session?.user ?? null, {
          showLoading: false,
          markInitialized: true,
        });
      }, 0);
    });

    window.addEventListener("focus", refreshSessionFromVisibility);
    document.addEventListener("visibilitychange", refreshSessionFromVisibility);

    return () => {
      mounted = false;
      window.removeEventListener("focus", refreshSessionFromVisibility);
      document.removeEventListener(
        "visibilitychange",
        refreshSessionFromVisibility
      );
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from login.");
    }

    return data.user;
  }

  async function signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
    setRole(null);
  }

  async function resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        role,
        isAdmin: role === "admin",
        login,
        signup,
        logout,
        resendConfirmation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}