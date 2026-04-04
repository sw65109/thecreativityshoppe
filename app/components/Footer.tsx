"use client";

import Image from "next/image";
import Link from "next/link";
import { SiFacebook } from "react-icons/si";
import { useContactModal } from "./contact/ContactModalProvider";

const FACEBOOK_URL = "https://facebook.com/";

export default function Footer() {
  const { openContactModal } = useContactModal();

  return (
    <div className="w-full bg-[url('/textures/red_wood_grain.jpg')] bg-cover bg-center bg-no-repeat">
      <footer className="w-full py-16 text-sandstone">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <Image
            src="/the_creativity_shoppe1.png"
            alt="Scott Weller Logo"
            width={240}
            height={240}
            loading="eager"
            className="mb-6 rounded-full bg-maple"
          />

          <nav
            aria-label="Footer navigation"
            className="mb-6 flex flex-wrap items-center justify-center gap-8 [-webkit-text-stroke:1px_var(--color-walnut)]"
          >
            <Link
              href="/"
              className="text-2xl font-bold transition hover:text-walnut/70 hover:underline underline-offset-4"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-2xl font-bold transition hover:text-walnut/70 hover:underline underline-offset-4"
            >
              Shop
            </Link>

            <button
              type="button"
              onClick={openContactModal}
              className="text-2xl font-bold transition hover:text-walnut/70 hover:underline underline-offset-4"
            >
              Contact
            </button>

            <Link
              href="/cart"
              className="text-2xl font-bold transition hover:text-walnut/70 hover:underline underline-offset-4"
            >
              Cart
            </Link>
          </nav>

          <div
            aria-label="Social links"
            className="mb-8 flex items-center justify-center"
          >
            <Link
              href="https://www.facebook.com/profile.php?id=100064039869291"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="text-blue-700 bg-sandstone inline-flex items-center justify-center rounded-full p-2 transition hover:bg-white/10"
            >
              <SiFacebook className="h-12 w-12" aria-hidden="true" />
            </Link>
          </div>

          <h3 className="mb-4 text-2xl font-semibold [-webkit-text-stroke:1px_var(--color-walnut)]">
            Stay in the Loop
          </h3>

          <form className="mt-6 mb-4 flex w-full max-w-md items-center gap-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-sandstone bg-sandstone/50 px-4 py-3 text-walnut font-semibold outline-none transition placeholder:text-walnut focus:border-sandstone"
            />
            <button
              type="submit"
              className="rounded-full bg-sandstone px-8 py-2 text-sm font-semibold text-walnut transition hover:bg-sandstone/50 border border-walnut"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-10 mb-10 max-w-sm text-lg font-bold leading-relaxed text-sandstone [-webkit-text-stroke:1px_var(--color-walnut)]">
            This form is protected by reCAPTCHA and the Google{" "}
            <Link
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-walnut"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              Terms of Service
            </Link>{" "}
            apply.
          </p>

          <p className="text-lg font-bold text-sandstone [-webkit-text-stroke:1px_var(--color-walnut)]">
            © {new Date().getFullYear()} The Creativity Shoppe. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}