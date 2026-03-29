"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import Image from "next/image";
import { useEffect, useState, type SyntheticEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

const CONTACT_EMAIL = "your-email@example.com";
const CONTACT_PHONE_DISPLAY = "(555) 555-5555";
const CONTACT_PHONE_TEL = "5555555555";
const FACEBOOK_URL = "https://facebook.com/";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, logout, loading, isAdmin } = useAuth();
  const { itemCount, ready: cartReady, clearLocalCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAdminRoute = pathname.startsWith("/admin");
  const currentSearch = searchParams.get("search") ?? "";

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAvatar() {
      if (!user) {
        setAvatarUrl(null);
        return;
      }

      const metadataAvatar =
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null;

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        setAvatarUrl(metadataAvatar);
        return;
      }

      setAvatarUrl(data?.avatar_url ?? metadataAvatar);
    }

    void loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!contactOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setContactOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contactOpen]);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) return null;

  async function handleLogout() {
    setAvatarOpen(false);
    setOpen(false);

    router.replace("/");
    clearLocalCart();

    await logout();
  }

  function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const trimmed = String(formData.get("search") ?? "").trim();

    if (!trimmed) {
      router.push("/shop");
      setOpen(false);
      return;
    }

    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  }

  function openContactModal() {
    setContactOpen(true);
    setOpen(false);
    setAvatarOpen(false);
  }

  function closeContactModal() {
    setContactOpen(false);
  }

  return (
    <nav className="relative w-full bg-background">
      <div className="mx-auto grid w-full grid-cols-[120px_1fr_auto] items-center gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[140px_1fr_auto] lg:px-8 2xl:max-w-450 2xl:px-12">
        <div className="flex items-center justify-start">
          <Link href="/">
            <Image
              src="/the_creativity_shoppe1.png"
              alt="The Creativity Shoppe Logo"
              width={112}
              height={112}
              loading="eager"
              className="rounded-full bg-sandstone object-contain"
            />
          </Link>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center gap-2 text-sandstone">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-wide lg:text-3xl"
          >
            The Creativity Shoppe
          </Link>

          <form
            key={`desktop-${currentSearch}`}
            onSubmit={handleSearch}
            className="flex w-64 items-center rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm lg:w-72 xl:w-80"
          >
            <input
              name="search"
              type="text"
              placeholder="Search..."
              defaultValue={currentSearch}
              className="w-full bg-transparent text-sm text-sandstone outline-none placeholder:text-sandstone lg:text-base"
            />
            <button type="submit" aria-label="Search products">
              <Search className="h-5 w-5 text-sandstone" />
            </button>
          </form>
        </div>

        <div className="hidden lg:flex items-center justify-end gap-5 text-sandstone font-semibold xl:gap-6 2xl:gap-8">
          <Link
            href="/"
            className="text-base hover:underline underline-offset-4 xl:text-lg"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-base hover:underline underline-offset-4 xl:text-lg"
          >
            Shop
          </Link>

          <button
            type="button"
            onClick={openContactModal}
            className="text-base hover:underline underline-offset-4 xl:text-lg"
          >
            Contact
          </button>

          {!loading && user && isAdmin ? (
            <Link
              href={isAdminRoute ? "/" : "/admin"}
              className="rounded-full border border-sandstone/40 px-4 py-2 text-sm transition hover:bg-sandstone hover:text-background"
            >
              {isAdminRoute ? "Store" : "Admin"}
            </Link>
          ) : null}

          {user ? (
            <div className="relative">
              <button onClick={() => setAvatarOpen((current) => !current)}>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    loading="eager"
                    className="h-9 w-9 cursor-pointer rounded-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-sandstone/40 text-sm font-bold text-sandstone hover:bg-sandstone hover:text-background">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
              </button>

              {avatarOpen ? (
                <div className="absolute right-0 z-50 mt-3 flex w-48 flex-col rounded-lg border border-sandstone/40 bg-background py-3 text-sandstone shadow-lg">
                  <Link
                    href="/account"
                    className="px-4 py-2 hover:bg-white/10 hover:underline underline-offset-4"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Account
                  </Link>

                  <Link
                    href="/orders"
                    className="px-4 py-2 hover:bg-white/10 hover:underline underline-offset-4"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Orders
                  </Link>

                  <button
                    onClick={() => void handleLogout()}
                    className="px-4 py-2 text-left hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-4xl border border-sandstone px-4 py-2 font-semibold text-sandstone"
            >
              Login
            </Link>
          )}

          <Link href="/cart" className="relative inline-flex">
            <ShoppingCart className="h-5 w-5" />
            {cartReady && itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-sandstone px-1 text-[8px] font-bold leading-none text-background">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        </div>

        <button
          className="justify-self-end text-sandstone lg:hidden"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-10 w-10" /> : <Menu className="h-10 w-10" />}
        </button>
      </div>

      {open ? (
        <div className="absolute left-0 top-full z-50 flex w-full flex-col items-center gap-6 bg-background py-8 text-sandstone shadow-lg lg:hidden">
          <form
            key={`mobile-${currentSearch}`}
            onSubmit={handleSearch}
            className="flex w-72 max-w-[90%] items-center rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
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
            onClick={() => setOpen(false)}
            className="text-lg font-medium hover:underline underline-offset-4"
          >
            Home
          </Link>

          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="text-lg font-medium hover:underline underline-offset-4"
          >
            Shop
          </Link>

          <button
            type="button"
            onClick={openContactModal}
            className="text-lg font-medium hover:underline underline-offset-4"
          >
            Contact
          </button>

          {!loading && user && isAdmin ? (
            <Link
              href={isAdminRoute ? "/" : "/admin"}
              onClick={() => setOpen(false)}
              className="text-lg font-medium hover:underline underline-offset-4"
            >
              {isAdminRoute ? "Store" : "Admin"}
            </Link>
          ) : null}

          {loading ? null : user ? (
            avatarUrl ? (
              <Link href="/account" onClick={() => setOpen(false)}>
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
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sandstone text-sm font-bold text-background"
              >
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </Link>
            )
          ) : (
            <Link
              href="/login"
              className="rounded-4xl bg-sandstone px-4 py-2 font-semibold text-background"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}

          <Link
            href="/cart"
            onClick={() => setOpen(false)}
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
      ) : null}

      {contactOpen ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-background/70 px-6"
          onClick={closeContactModal}
          role="dialog"
          aria-modal="true"
          aria-label="Contact information"
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-sandstone/30 bg-background p-6 text-sandstone shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sandstone/70">
                  Contact
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Get in touch</h2>
              </div>

              <button
                type="button"
                onClick={closeContactModal}
                className="rounded-full border border-sandstone/40 px-3 py-1 text-sm transition hover:bg-sandstone hover:text-background"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sandstone/90">
              <div className="rounded-2xl border border-sandstone/20 bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-sandstone/70">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-2 block text-lg font-semibold hover:underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>

              <div className="rounded-2xl border border-sandstone/20 bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-sandstone/70">
                  Phone
                </p>
                <a
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  className="mt-2 block text-lg font-semibold hover:underline underline-offset-4"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </div>

              <div className="rounded-2xl border border-sandstone/20 bg-white/5 p-4">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-lg font-semibold hover:underline underline-offset-4"
                >
                  <SiFacebook className="h-10 w-10" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
