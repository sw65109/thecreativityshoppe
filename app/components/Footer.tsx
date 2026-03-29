"use client";

import Image from "next/image";
import Link from "next/link";
import { SiFacebook } from "react-icons/si";

const FACEBOOK_URL = "https://facebook.com/";

export default function Footer() {
  return (
    <footer className="w-full bg-background text-sandstone py-16">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center px-6">
        <Image
          src="/the_creativity_shoppe1.png"
          alt="Scott Weller Logo"
          width={240}
          height={240}
          loading="eager"
          className="mb-6 bg-sandstone rounded-full"
        />

        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          <Link
            href="/"
            className="text-lg font-medium transition hover:text-sandstone/70 hover:underline underline-offset-4"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-lg font-medium transition hover:text-sandstone/70 hover:underline underline-offset-4"
          >
            Shop
          </Link>

          <Link
            href="/contact"
            className="text-lg font-medium transition hover:text-sandstone/70 hover:underline underline-offset-4"
          >
            Contact
          </Link>

          <Link
            href="/cart"
            className="text-lg font-medium transition hover:text-sandstone/70 hover:underline underline-offset-4"
          >
            Cart
          </Link>

          <Link
            href={FACEBOOK_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="inline-flex items-center justify-center rounded-full p-2 transition hover:bg-white/10"
          >
            <SiFacebook className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <h3 className="text-2xl font-semibold mb-4">Stay in the Loop</h3>

        <form className="w-full max-w-md flex items-center gap-3 mt-6 mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-sandstone placeholder:text-sandstone/60 outline-none border border-sandstone/30 focus:border-sandstone transition"
          />
          <button
            type="submit"
            className="px-8 py-2 bg-sandstone text-sm text-background font-semibold rounded-full hover:bg-sandstone/90 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-sandstone/60 max-w-sm mt-10 mb-10 leading-relaxed">
          This form is protected by reCAPTCHA and the Google{" "}
          <Link
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-sandstone"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-sandstone"
          >
            Terms of Service
          </Link>{" "}
          apply.
        </p>

        <p className="text-sm text-sandstone/70">
          © {new Date().getFullYear()} The Creativity Shoppe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}