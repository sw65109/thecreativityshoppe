import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-sandstone text-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="w-full border-b border-background/15 bg-background/10 p-6 lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-background/60">
              Admin
            </p>
            <h1 className="mt-2 text-2xl font-semibold">The Creativity Shoppe</h1>
          </div>

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-background/15 px-4 py-3 transition hover:bg-background hover:text-sandstone"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}