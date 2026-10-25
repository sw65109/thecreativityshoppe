/// <reference lib="deno.ns" />

import { buildCorsPreflightResponse } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/responses.ts";
import { requireAdmin } from "../_shared/auth.ts";

const PROTECTED_ADMIN_IDS = (Deno.env.get("PROTECTED_ADMIN_IDS") ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

type DisableUserRequest = {
  userId?: string;
};

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return buildCorsPreflightResponse();
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed.", 405);
  }

  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return auth.response!;
  }

  const adminClient = auth.adminClient!;

  let payload: DisableUserRequest;

  try {
    payload = (await request.json()) as DisableUserRequest;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const userId = String(payload.userId ?? "").trim();

  if (!userId) {
    return errorResponse("User id is required.", 400);
  }

  if (PROTECTED_ADMIN_IDS.includes(userId)) {
    return errorResponse("This admin account is protected and cannot be disabled.", 403);
  }

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: "876000h",
  });

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ success: true, userId, disabled: true });
});