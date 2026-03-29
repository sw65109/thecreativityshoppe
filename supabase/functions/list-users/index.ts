/// <reference lib="deno.ns" />

import { buildCorsPreflightResponse } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/responses.ts";
import { requireAdmin } from "../_shared/auth.ts";

type ProfileRow = {
  id: string;
  role: string | null;
  created_at: string | null;
};

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return buildCorsPreflightResponse();
  }

  if (request.method !== "GET") {
    return errorResponse("Method not allowed.", 405);
  }

  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return auth.response!;
  }

  const adminClient = auth.adminClient!;

  const {
    data: { users },
    error: usersError,
  } = await adminClient.auth.admin.listUsers();

  if (usersError) {
    return errorResponse(usersError.message, 500);
  }

  const userIds = users.map((user) => user.id);

  const { data: profiles, error: profilesError } = userIds.length
    ? await adminClient
        .from("profiles")
        .select("id, role, created_at")
        .in("id", userIds)
    : { data: [], error: null };

  if (profilesError) {
    return errorResponse(profilesError.message, 500);
  }

  const profileMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  );

  const mergedUsers = users.map((user) => {
    const profile = profileMap.get(user.id);

    return {
      id: user.id,
      email: user.email ?? null,
      role: profile?.role ?? "customer",
      created_at: profile?.created_at ?? user.created_at ?? null,
      banned_until: user.banned_until ?? null,
      disabled: Boolean(
        user.banned_until &&
          new Date(user.banned_until).getTime() > Date.now(),
      ),
    };
  });

  return jsonResponse({ users: mergedUsers });
});