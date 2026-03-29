/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { errorResponse } from "./responses.ts";

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("Authorization")?.trim() ?? "";

  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

function createUserClient() {
  return createClient(
    getRequiredEnv("PROJECT_URL"),
    getRequiredEnv("ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export function createAdminClient() {
  return createClient(
    getRequiredEnv("PROJECT_URL"),
    getRequiredEnv("SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export type AdminClient = ReturnType<typeof createAdminClient>;

type RequireAdminResult =
  | {
      ok: true;
      user: {
        id: string;
        email: string | null;
      };
      adminClient: AdminClient;
    }
  | {
      ok: false;
      response: Response;
    };

export async function requireAdmin(
  request: Request,
): Promise<RequireAdminResult> {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      ok: false,
      response: errorResponse("Missing authorization header.", 401),
    };
  }

  const userClient = createUserClient();

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser(accessToken);

  if (authError || !user) {
    return {
      ok: false,
      response: errorResponse(authError?.message ?? "Unauthorized.", 401),
    };
  }

  const adminClient = createAdminClient();

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      response: errorResponse(profileError.message, 500),
    };
  }

  if (profile?.role !== "admin") {
    return {
      ok: false,
      response: errorResponse("Forbidden.", 403),
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    adminClient,
  };
}