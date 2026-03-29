"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const validOtpTypes: ReadonlySet<EmailOtpType> = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function ConfirmEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const code = params.get("code");
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    let cancelled = false;

    async function verifyEmail() {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (cancelled) return;

          if (error) {
            setMessage(
              "We could not confirm your email. Redirecting to login...",
            );
            router.replace("/login");
            return;
          }

          setMessage("Email confirmed. Redirecting to login...");
          router.replace("/login");
          return;
        }

        if (tokenHash && type && validOtpTypes.has(type as EmailOtpType)) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });

          if (cancelled) return;

          if (error) {
            setMessage(
              "We could not confirm your email. Redirecting to login...",
            );
            router.replace("/login");
            return;
          }

          setMessage("Email confirmed. Redirecting to login...");
          router.replace("/login");
          return;
        }

        setMessage(
          "This confirmation link is invalid or expired. Redirecting to login...",
        );
        router.replace("/login");
      } catch {
        if (cancelled) return;
        setMessage("We could not confirm your email. Redirecting to login...");
        router.replace("/login");
      }
    }

    void verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sandstone">
      {message}
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sandstone">
          Verifying your email...
        </div>
      }
    >
      <ConfirmEmailInner />
    </Suspense>
  );
}
