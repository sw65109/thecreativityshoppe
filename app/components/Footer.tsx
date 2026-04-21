"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { SiFacebook } from "react-icons/si";
import { useContactModal } from "./contact/ContactModalProvider";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100064039869291";
const RECAPTCHA_ACTION = "footer_newsletter_signup";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function Footer() {
  const { openContactModal } = useContactModal();
  const siteKey = useMemo(
    () => process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "",
    [],
  );

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function getRecaptchaToken() {
    if (!siteKey) {
      throw new Error("reCAPTCHA site key is not configured.");
    }

    if (!window.grecaptcha) {
      throw new Error("reCAPTCHA is not loaded yet. Please try again.");
    }

    return await new Promise<string>((resolve, reject) => {
      try {
        window.grecaptcha?.ready(async () => {
          try {
            const token = await window.grecaptcha!.execute(siteKey, {
              action: RECAPTCHA_ACTION,
            });
            resolve(token);
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage("Please enter your email.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          recaptchaToken,
          action: RECAPTCHA_ACTION,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok: true }
        | { error: string }
        | null;

      if (!response.ok) {
        const err =
          payload && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Signup failed. Please try again.";
        setMessage(err);
        return;
      }

      setEmail("");
      setMessage("Thanks! You're signed up.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Signup failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[url('/textures/red_wood_grain.jpg')] bg-cover bg-center bg-no-repeat">
      {siteKey ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
            siteKey,
          )}`}
          strategy="afterInteractive"
        />
      ) : null}

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
            className="mb-6 flex flex-wrap items-center justify-center gap-8"
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
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="text-blue-700 bg-sandstone inline-flex items-center justify-center rounded-full p-2 transition hover:bg-white/10"
            >
              <SiFacebook className="h-12 w-12" aria-hidden="true" />
            </Link>
          </div>

          <h3 className="mb-4 text-2xl font-semibold">Stay in the Loop</h3>

          <form
            onSubmit={handleSubmit}
            className="mt-6 mb-4 flex w-full max-w-md items-center gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-lg border border-sandstone bg-sandstone/50 px-4 py-3 text-walnut font-semibold outline-none transition placeholder:text-walnut focus:border-sandstone"
            />
            <button
              type="submit"
              disabled={isSubmitting || !siteKey}
              className="rounded-full bg-sandstone px-8 py-2 text-sm font-semibold text-walnut transition hover:bg-sandstone/50 border border-walnut disabled:opacity-60"
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {message ? (
            <p className="mb-6 text-lg font-bold text-sandstone">{message}</p>
          ) : null}

          <p className="mt-10 mb-10 max-w-sm text-lg font-bold leading-relaxed text-sandstone">
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

          <p className=" mb-10 text-lg font-bold text-sandstone">
            All items are handmade; grain/color will vary from photos. Woods used vary
            by product and availability. Any wood name shown in the product
            options/description is the wood used for that item. We use responsibly
            sourced materials and avoid restricted species. We comply with all U.S.
            and international regulations regarding protected wood species, including
            CITES and the Lacey Act.
          </p>

          <p className="text-lg font-bold text-sandstone">
            © {new Date().getFullYear()} The Creativity Shoppe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}