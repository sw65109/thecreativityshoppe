import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdminServerAuthed } from "@/lib/requireAdminServerAuthed";
import AdminGuard from "@/app/components/admin/AdminGuard";
import AdminShell from "@/app/components/admin/AdminShell";
import BackgroundSplashGate from "../components/BackgroundSplashGate";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  let authorized = true;

  try {
    await requireAdminServerAuthed();
  } catch {
    authorized = false;
  }

  if (!authorized) {
    redirect("/login");
  }

  return (
    <AdminGuard>
      <AdminShell>
        <BackgroundSplashGate minMs={250} />
        {children}
      </AdminShell>
    </AdminGuard>
  );
}
