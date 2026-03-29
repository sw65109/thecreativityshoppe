import { supabase } from "@/lib/supabaseClient";

export type AdminUser = {
  id: string;
  email: string | null;
  role: string;
  created_at: string | null;
  banned_until: string | null;
  disabled: boolean;
};

type ListUsersResult = {
  users: AdminUser[];
};

type MutateUserResult = {
  success: boolean;
  userId: string;
  disabled?: boolean;
};

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

async function getFreshAccessToken() {
  const {
    data: { session: currentSession },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = currentSession?.expires_at ?? 0;
  const needsRefresh = !currentSession?.access_token || expiresAt <= now + 30;

  if (!needsRefresh) {
    return currentSession.access_token;
  }

  const {
    data: refreshed,
    error: refreshError,
  } = await supabase.auth.refreshSession();

  if (refreshError) {
    throw new Error(refreshError.message);
  }

  if (!refreshed.session?.access_token) {
    throw new Error("No active Supabase session was found.");
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

async function invokeAdminFunction<T>(
  name: string,
  options?: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
  },
): Promise<T> {
  const accessToken = await getFreshAccessToken();
  const anonKey = getSupabaseAnonKey();

  const response = await fetch(getSupabaseFunctionUrl(name), {
    method: options?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  const data = (await response.json()) as T;

  if (!data) {
    throw new Error(`${name} returned no data.`);
  }

  return data;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const result = await invokeAdminFunction<ListUsersResult>("list-users", {
    method: "GET",
  });

  return result.users ?? [];
}

export async function deleteAdminUser(userId: string) {
  return invokeAdminFunction<MutateUserResult>("delete-user", {
    method: "POST",
    body: { userId },
  });
}

export async function enableAdminUser(userId: string) {
  return invokeAdminFunction<MutateUserResult>("enable-user", {
    method: "POST",
    body: { userId },
  });
}

export async function disableAdminUser(userId: string) {
  return invokeAdminFunction<MutateUserResult>("disable-user", {
    method: "POST",
    body: { userId },
  });
}