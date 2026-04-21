"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type SyntheticEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useContactModal } from "./contact/ContactModalProvider";
import { useNavbarAvatar } from "./navbar/useNavbarAvatar";
import DesktopNav from "./navbar/DesktopNav";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, logout, loading, isAdmin } = useAuth();
  const { itemCount, ready: cartReady, clearLocalCart } = useCart();
  const { openContactModal } = useContactModal();

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAdminRoute = pathname.startsWith("/admin");
  const currentSearch = searchParams.get("search") ?? "";

  const { avatarUrl } = useNavbarAvatar(user);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full bg-[url('/textures/red_wood_grain.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="h-33" />
      </div>
    );
  }

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

  function handleOpenContact() {
    setOpen(false);
    setAvatarOpen(false);
    openContactModal();
  }

  return (
    <div className="bg-[url('/textures/red_wood_grain.jpg')] bg-cover bg-top bg-no-repeat">
      <nav className="relative w-fullS">
        <div className="mx-auto grid w-full grid-cols-[120px_1fr_auto] items-center gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[140px_1fr_auto] lg:px-8 2xl:max-w-450 2xl:px-12">
          <div className="flex items-center justify-start">
            <Link href="/">
              <Image
                src="/the_creativity_shoppe1.png"
                alt="The Creativity Shoppe Logo"
                width={112}
                height={112}
                loading="eager"
                className="rounded-full bg-maple object-contain"
              />
            </Link>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center gap-2 text-sandstone">
            <Link href="/" className="text-2xl font-semibold tracking-wide lg:text-3xl">
              The Creativity Shoppe
            </Link>

            <form
              key={`desktop-${currentSearch}`}
              onSubmit={handleSearch}
              className="flex w-64 items-center rounded-full bg-sandstone/20 px-4 py-2 backdrop-blur-sm lg:w-72 xl:w-80"
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

          <DesktopNav
            loading={loading}
            user={user}
            isAdmin={isAdmin}
            isAdminRoute={isAdminRoute}
            avatarUrl={avatarUrl}
            cartReady={cartReady}
            itemCount={itemCount}
            avatarOpen={avatarOpen}
            setAvatarOpen={setAvatarOpen}
            onOpenContact={handleOpenContact}
            onLogout={() => void handleLogout()}
          />

          <button
            className="justify-self-end text-sandstone lg:hidden"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="h-10 w-10" /> : <Menu className="h-10 w-10" />}
          </button>
        </div>

        <MobileMenu
          open={open}
          currentSearch={currentSearch}
          loading={loading}
          user={user}
          isAdmin={isAdmin}
          isAdminRoute={isAdminRoute}
          avatarUrl={avatarUrl}
          cartReady={cartReady}
          itemCount={itemCount}
          onClose={() => setOpen(false)}
          onOpenContact={handleOpenContact}
          onSearchSubmit={handleSearch}
          onLogout={() => void handleLogout()}
        />
      </nav>
    </div>
  );
}