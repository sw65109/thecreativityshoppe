"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type ProtectedRouteOptions = {
  requireAdmin?: boolean;
  unauthenticatedRedirectTo?: string;
  unauthorizedRedirectTo?: string;
};

export function useProtectedRoute(options: ProtectedRouteOptions = {}) {
  const {
    requireAdmin = false,
    unauthenticatedRedirectTo = "/login",
    unauthorizedRedirectTo = "/",
  } = options;

  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) {
      return;
    }

    if (!auth.user) {
      router.replace(unauthenticatedRedirectTo);
      return;
    }

    if (requireAdmin && !auth.isAdmin) {
      router.replace(unauthorizedRedirectTo);
    }
  }, [
    auth.isAdmin,
    auth.loading,
    auth.user,
    requireAdmin,
    router,
    unauthenticatedRedirectTo,
    unauthorizedRedirectTo,
  ]);

  return {
    ...auth,
    canAccess: Boolean(auth.user) && (!requireAdmin || auth.isAdmin),
  };
}