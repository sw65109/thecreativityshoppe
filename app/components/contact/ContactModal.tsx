"use client";

import { SiFacebook } from "react-icons/si";

const CONTACT_EMAIL = "thecreativityshoppe@gmail.com";
const CONTACT_PHONE_DISPLAY = "(573) 645-5804";
const CONTACT_PHONE_TEL = "(573) 645-5804";
const FACEBOOK_URL = "https://facebook.com/";

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-background/70 px-6"
      onClick={onClose}
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
            onClick={onClose}
            className="rounded-full border border-sandstone/40 px-3 py-1 text-sm transition hover:bg-sandstone hover:text-background"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sandstone/90">
          <div className="rounded-2xl border border-sandstone/20 bg-sandstone/5 p-4">
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

          <div className="rounded-2xl border border-sandstone/20 bg-sandstone/5 p-4">
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

          <div className="rounded-2xl border border-sandstone/20 bg-sandstone/5 p-4">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-blue-700 hover:underline underline-offset-4"
            >
              <SiFacebook className="h-10 w-10" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}