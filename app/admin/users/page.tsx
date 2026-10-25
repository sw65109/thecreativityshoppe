import AdminUsersClient from "./AdminUsersClient";

function getProtectedAdminIds() {
  return (process.env.PROTECTED_ADMIN_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export default function AdminUsersPage() {
  return <AdminUsersClient protectedAdminIds={getProtectedAdminIds()} />;
}