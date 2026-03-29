"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, initialized, isAdmin } = useAuth();

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [initialized, isAdmin, router, user]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sandstone">
        Checking admin access...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sandstone">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}