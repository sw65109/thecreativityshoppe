"use client";

import { useEffect, useState } from "react";
import { makeAdmin, removeAdmin } from "./actions";
import { useAuth } from "@/app/context/AuthContext";
import {
  deleteAdminUser,
  disableAdminUser,
  enableAdminUser,
  listAdminUsers,
  type AdminUser,
} from "@/lib/adminUsersClient";

const PROTECTED_ADMIN_ID = "a85e214b-b408-44be-a21a-58ee06115b62";

function formatCreatedDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function AdminUsersClient() {
  const { initialized, user, isAdmin } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      if (!initialized) {
        return;
      }

      if (!user || !isAdmin) {
        if (!cancelled) {
          setUsers([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextUsers = await listAdminUsers();

        if (!cancelled) {
          setUsers(nextUsers);
        }
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [initialized, isAdmin, refreshKey, user]);

  async function runUserAction(
    userId: string,
    action: "delete" | "disable" | "enable",
  ) {
    setPendingUserId(userId);
    setPendingAction(action);
    setError(null);

    try {
      if (action === "delete") {
        await deleteAdminUser(userId);
      } else if (action === "disable") {
        await disableAdminUser(userId);
      } else {
        await enableAdminUser(userId);
      }

      setRefreshKey((value) => value + 1);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setPendingUserId(null);
      setPendingAction(null);
    }
  }

  if (!initialized || loading) {
    return (
      <section className="space-y-8 text-background">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Admin
          </p>
          <h2 className="mt-2 text-4xl font-semibold">Users</h2>
          <p className="mt-3 text-background/70">Loading users...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 text-background">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-background/60">
          Admin
        </p>
        <h2 className="mt-2 text-4xl font-semibold">Users</h2>
        <p className="mt-3 text-background/70">
          This page now uses the deployed admin user functions for listing,
          disabling, enabling, and deleting users.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-700/30 bg-red-100 p-4 text-red-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-background/15">
        <table className="w-full border-collapse bg-background/10">
          <thead>
            <tr className="border-b border-background/15 text-left text-sm text-background/60">
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length ? (
              users.map((account) => {
                const isProtectedAdmin = account.id === PROTECTED_ADMIN_ID;
                const isCurrentUser = account.id === user?.id;
                const isBusy = pendingUserId === account.id;
                const isAdminRole = account.role === "admin";

                return (
                  <tr
                    key={account.id}
                    className="border-b border-background/10 align-top"
                  >
                    <td className="px-6 py-4">{account.email ?? "No email"}</td>
                    <td className="px-6 py-4 capitalize">
                      {account.role ?? "customer"}
                    </td>
                    <td className="px-6 py-4">
                      {account.disabled ? "Disabled" : "Active"}
                    </td>
                    <td className="px-6 py-4">
                      {formatCreatedDate(account.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {isAdminRole ? (
                          isProtectedAdmin ? (
                            <span className="inline-block rounded-lg border border-background/15 px-3 py-2 text-sm text-background/55">
                              Protected Admin
                            </span>
                          ) : (
                            <form action={removeAdmin}>
                              <input
                                type="hidden"
                                name="userId"
                                value={account.id}
                              />
                              <button
                                type="submit"
                                className="rounded-lg border border-background/15 px-3 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                              >
                                Remove Admin
                              </button>
                            </form>
                          )
                        ) : (
                          <form action={makeAdmin}>
                            <input
                              type="hidden"
                              name="userId"
                              value={account.id}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-background/15 px-3 py-2 text-sm transition hover:bg-background hover:text-sandstone"
                            >
                              Make Admin
                            </button>
                          </form>
                        )}

                        {account.disabled ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void runUserAction(account.id, "enable")}
                            className="rounded-lg border border-background/15 px-3 py-2 text-sm transition hover:bg-background hover:text-sandstone disabled:opacity-60"
                          >
                            {isBusy && pendingAction === "enable"
                              ? "Enabling..."
                              : "Enable"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy || isProtectedAdmin || isCurrentUser}
                            onClick={() => void runUserAction(account.id, "disable")}
                            className="rounded-lg border border-background/15 px-3 py-2 text-sm transition hover:bg-background hover:text-sandstone disabled:opacity-60"
                          >
                            {isBusy && pendingAction === "disable"
                              ? "Disabling..."
                              : "Disable"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isBusy || isProtectedAdmin || isCurrentUser}
                          onClick={() => void runUserAction(account.id, "delete")}
                          className="rounded-lg border border-background/15 px-3 py-2 text-sm transition hover:bg-background hover:text-sandstone disabled:opacity-60"
                        >
                          {isBusy && pendingAction === "delete"
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-6 py-6 text-background/70" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}