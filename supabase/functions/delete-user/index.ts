/// <reference lib="deno.ns" />

import { buildCorsPreflightResponse } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/responses.ts";
import { requireAdmin } from "../_shared/auth.ts";

const PROTECTED_ADMIN_ID = "a85e214b-b408-44be-a21a-58ee06115b62";

type DeleteUserRequest = {
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

  let payload: DeleteUserRequest;

  try {
    payload = (await request.json()) as DeleteUserRequest;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const userId = String(payload.userId ?? "").trim();

  if (!userId) {
    return errorResponse("User id is required.", 400);
  }

  if (userId === PROTECTED_ADMIN_ID) {
    return errorResponse("This admin account is protected and cannot be deleted.", 403);
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return errorResponse(error.message, 500);
  }

  await adminClient.from("profiles").delete().eq("id", userId);

  return jsonResponse({ success: true, userId });
});