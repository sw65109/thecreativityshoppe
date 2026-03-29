const ADMIN_EMAILS = new Set(["sjweller65109@gmail.com"]);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.has(email.toLowerCase());
}