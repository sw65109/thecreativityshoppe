import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

type VerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  if (!/^\S+@\S+\.\S+$/.test(trimmed)) return null;
  return trimmed;
}

export async function POST(request: Request) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

  if (!secret) {
    return Response.json(
      { error: "Server is missing RECAPTCHA_SECRET_KEY." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const email = normalizeEmail(record.email);
  const recaptchaToken =
    typeof record.recaptchaToken === "string" ? record.recaptchaToken.trim() : "";
  const expectedAction =
    typeof record.action === "string" ? record.action.trim() : "";

  if (!email) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!recaptchaToken) {
    return Response.json({ error: "Missing reCAPTCHA token." }, { status: 400 });
  }

  if (!expectedAction) {
    return Response.json({ error: "Missing reCAPTCHA action." }, { status: 400 });
  }

  const verifyBody = new URLSearchParams();
  verifyBody.set("secret", secret);
  verifyBody.set("response", recaptchaToken);

  const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyBody.toString(),
  });

  if (!verifyRes.ok) {
    return Response.json(
      { error: "Failed to verify reCAPTCHA." },
      { status: 502 },
    );
  }

  const verifyJson = (await verifyRes.json()) as VerifyResponse;

  if (!verifyJson.success) {
    return Response.json(
      { error: "reCAPTCHA verification failed." },
      { status: 400 },
    );
  }

  if (verifyJson.action && verifyJson.action !== expectedAction) {
    return Response.json(
      { error: "reCAPTCHA action mismatch." },
      { status: 400 },
    );
  }

  const score = Number(verifyJson.score ?? 0);
  if (!Number.isFinite(score) || score < minScore) {
    return Response.json(
      { error: "reCAPTCHA score too low. Please try again." },
      { status: 400 },
    );
  }

  const { error: insertError } = await supabaseServer
    .from("newsletter_signups")
    .insert({
      email,
      source: "footer",
    });

  if (insertError) {
    const message = insertError.message.toLowerCase();

    if (message.includes("duplicate") || message.includes("unique")) {
      // Treat duplicates as success (user is already subscribed)
      return Response.json({ ok: true });
    }

    return Response.json({ error: insertError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}