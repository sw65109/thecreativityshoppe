/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAdminClient } from "./auth.ts";
import { errorResponse } from "./responses.ts";

type AdminClient = ReturnType<typeof createAdminClient>;

type RequireUserResult =
  | {
      ok: true;
      user: {
        id: string;
        email: string | null;
        user_metadata: Record<string, unknown> | null;
      };
      adminClient: AdminClient;
    }
  | {
      ok: false;
      response: Response;
    };

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

export async function requireUser(
  request: Request,
): Promise<RequireUserResult> {
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
    error,
  } = await userClient.auth.getUser(accessToken);

  if (error || !user) {
    return {
      ok: false,
      response: errorResponse(error?.message ?? "Unauthorized.", 401),
    };
  }

  const adminClient = createAdminClient();

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? null,
      user_metadata: user.user_metadata ?? null,
    },
    adminClient,
  };
}