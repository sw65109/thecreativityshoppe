"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { SyntheticEvent } from "react";

type MobileMenuProps = {
  open: boolean;
  currentSearch: string;

  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  isAdminRoute: boolean;
  avatarUrl: string | null;

  cartReady: boolean;
  itemCount: number;

  onClose: () => void;
  onOpenContact: () => void;
  onSearchSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  onLogout: () => void;
};

export default function MobileMenu({
  open,
  currentSearch,
  loading,
  user,
  isAdmin,
  isAdminRoute,
  avatarUrl,
  cartReady,
  itemCount,
  onClose,
  onOpenContact,
  onSearchSubmit,
  onLogout,
}: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="absolute left-0 top-full z-50 flex w-full flex-col items-center gap-6 bg-[url('/textures/old_oak.jpg')] py-8 text-sandstone shadow-lg lg:hidden">
      <form
        key={`mobile-${currentSearch}`}
        onSubmit={onSearchSubmit}
        className="flex w-72 max-w-[90%] items-center rounded-full bg-sandstone/20 px-4 py-2 backdrop-blur-sm"
      >
        <input
          name="search"
          type="text"
          placeholder="Search..."
          defaultValue={currentSearch}
          className="w-full bg-transparent text-sandstone outline-none placeholder:text-sandstone"
        />
        <button type="submit" aria-label="Search products">
          <Search className="h-5 w-5 text-sandstone" />
        </button>
      </form>

      <Link
        href="/"
        onClick={onClose}
        className="text-lg font-medium hover:underline underline-offset-4"
      >
        Home
      </Link>

      <Link
        href="/shop"
        onClick={onClose}
        className="text-lg font-medium hover:underline underline-offset-4"
      >
        Shop
      </Link>

      <button
        type="button"
        onClick={onOpenContact}
        className="text-lg font-medium hover:underline underline-offset-4"
      >
        Contact
      </button>

      {!loading && user && isAdmin ? (
        <Link
          href={isAdminRoute ? "/" : "/admin"}
          onClick={onClose}
          className="text-lg font-medium hover:underline underline-offset-4"
        >
          {isAdminRoute ? "Store" : "Admin"}
        </Link>
      ) : null}

      {loading ? null : user ? (
        avatarUrl ? (
          <Link href="/account" onClick={onClose}>
            <Image
              src={avatarUrl}
              alt="User Avatar"
              width={36}
              height={36}
              loading="eager"
              className="h-9 w-9 rounded-full object-cover object-center"
            />
          </Link>
        ) : (
          <Link
            href="/account"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sandstone text-sm font-bold text-background"
          >
            {user.email?.[0]?.toUpperCase() ?? "U"}
          </Link>
        )
      ) : (
        <Link
          href="/login"
          className="rounded-4xl bg-sandstone px-4 py-2 font-semibold text-background"
          onClick={onClose}
        >
          Login
        </Link>
      )}

      {!loading && user ? (
        <button
          type="button"
          onClick={onLogout}
          className="text-lg font-medium hover:underline underline-offset-4"
        >
          Logout
        </button>
      ) : null}

      <Link
        href="/cart"
        onClick={onClose}
        className="relative inline-flex items-center text-lg font-medium hover:underline underline-offset-4"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartReady && itemCount > 0 ? (
          <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sandstone px-1 text-[10px] font-bold leading-none text-background">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
        <span className="ml-3">Cart</span>
      </Link>
    </div>
  );
}