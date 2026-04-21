import type { ReactNode } from "react";
import AdminGuard from "@/app/components/admin/AdminGuard";
import AdminShell from "@/app/components/admin/AdminShell";
import BackgroundSplashGate from "../components/BackgroundSplashGate";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <AdminShell>
        <BackgroundSplashGate minMs={250} />
        {children}
      </AdminShell>
    </AdminGuard>
  );
}
