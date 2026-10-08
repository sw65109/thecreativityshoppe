"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import UserMenuDesktop from "./UserMenuDesktop";

type DesktopNavProps = {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  isAdminRoute: boolean;
  avatarUrl: string | null;

  cartReady: boolean;
  itemCount: number;

  avatarOpen: boolean;
  setAvatarOpen: (next: boolean) => void;

  onOpenContact: () => void;
  onLogout: () => void;
};

export default function DesktopNav({
  loading,
  user,
  isAdmin,
  isAdminRoute,
  avatarUrl,
  cartReady,
  itemCount,
  avatarOpen,
  setAvatarOpen,
  onOpenContact,
  onLogout,
}: DesktopNavProps) {
  return (
    <div className="hidden lg:flex items-center justify-end gap-5 text-sandstone font-bold xl:gap-6 2xl:gap-8">
      <Link href="/" className="text-xl hover:underline underline-offset-4">
        Home
      </Link>

      <Link href="/shop" className="text-xl hover:underline underline-offset-4">
        Shop
      </Link>

      <Link
        href="/orders"
        className="text-xl hover:underline underline-offset-4"
      >
        Orders
      </Link>

      <button
        type="button"
        onClick={onOpenContact}
        className="text-xl hover:underline underline-offset-4"
      >
        Contact
      </button>

      {!loading && user && isAdmin ? (
        <Link
          href={isAdminRoute ? "/" : "/admin"}
          className="rounded-full border border-sandstone/40 px-4 py-2 text-md transition hover:bg-sandstone hover:text-background"
        >
          {isAdminRoute ? "Store" : "Admin"}
        </Link>
      ) : null}

      {user ? (
        <UserMenuDesktop
          user={user}
          avatarUrl={avatarUrl}
          avatarOpen={avatarOpen}
          setAvatarOpen={setAvatarOpen}
          onLogout={onLogout}
        />
      ) : (
        <Link
          href="/login"
          className="rounded-4xl border border-sandstone px-4 py-2 font-semibold text-sandstone"
        >
          Login
        </Link>
      )}

      <Link
        href="/cart"
        aria-label={`Shopping cart${cartReady ? `, ${itemCount} ${itemCount === 1 ? "item" : "items"}` : ""}`}
        className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sandstone focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ShoppingCart className="h-7 w-7" />
        {cartReady && itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-4 items-center justify-center rounded-full bg-sandstone px-1 text-[14px] font-bold leading-none text-background">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
