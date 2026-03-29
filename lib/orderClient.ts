import { supabase } from "@/lib/supabaseClient";
import type {
  CreateOrderFunctionInput,
  CreateOrderFunctionResult,
} from "@/types/order";

function getSupabaseFunctionUrl(name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return `${baseUrl}/functions/v1/${name}`;
}

function getSupabaseAnonKey() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.");
  }

  return anonKey;
}

async function getOptionalAccessToken() {
  const {
    data: { session: currentSession },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!currentSession?.access_token) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = currentSession.expires_at ?? 0;
  const needsRefresh = expiresAt <= now + 30;

  if (!needsRefresh) {
    return currentSession.access_token;
  }

  const {
    data: refreshed,
    error: refreshError,
  } = await supabase.auth.refreshSession();

  if (refreshError || !refreshed.session?.access_token) {
    return null;
  }

  return refreshed.session.access_token;
}

async function parseErrorResponse(response: Response) {
  try {
    const payload = await response.json();

    if (
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
    ) {
      return payload.error;
    }

    if (
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
    ) {
      return payload.message;
    }

    return JSON.stringify(payload);
  } catch {
    try {
      return await response.text();
    } catch {
      return `Request failed with status ${response.status}.`;
    }
  }
}

export async function createOrderFromCart(
  input: CreateOrderFunctionInput,
): Promise<CreateOrderFunctionResult> {
  const accessToken = await getOptionalAccessToken();
  const anonKey = getSupabaseAnonKey();

  const headers: Record<string, string> = {
    apikey: anonKey,
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(getSupabaseFunctionUrl("create-order"), {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  const data = (await response.json()) as CreateOrderFunctionResult;

  if (!data) {
    throw new Error("Order function returned no data.");
  }

  return data;
}