/// <reference lib="deno.ns" />

import { buildCorsPreflightResponse } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/responses.ts";
import { requireAdmin } from "../_shared/auth.ts";

type EnableUserRequest = {
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

  let payload: EnableUserRequest;

  try {
    payload = (await request.json()) as EnableUserRequest;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const userId = String(payload.userId ?? "").trim();

  if (!userId) {
    return errorResponse("User id is required.", 400);
  }

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ success: true, userId, disabled: false });
});