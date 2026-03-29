"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const accountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/info", label: "Personal Info" },
  { href: "/account/security", label: "Security" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/payments", label: "Payments" },
];

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, initialized, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    if (!user) {
      router.replace("/");
    }
  }, [initialized, loading, router, user]);

  if (!initialized || loading) {
    return (
      <section className="min-h-screen bg-sandstone px-6 py-10 text-background md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
            Loading account...
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="min-h-screen bg-sandstone px-6 py-10 text-background md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-background/20 bg-background/10 p-6 text-background/70">
            Redirecting to home...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-sandstone px-6 py-10 text-background md:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Your Profile</h1>
          <p className="mt-3 max-w-2xl text-background/70">
            Manage your personal details, security, addresses, orders, and
            payment settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-3xl border border-background/20 bg-background/10 p-4">
            <nav className="grid gap-2">
              {accountLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/account" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-2xl border px-4 py-3 transition",
                      isActive
                        ? "border-background bg-background text-sandstone"
                        : "border-background/15 hover:bg-background hover:text-sandstone",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}