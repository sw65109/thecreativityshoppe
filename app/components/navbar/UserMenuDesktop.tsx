"use client";

import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

type UserMenuDesktopProps = {
  user: User;
  avatarUrl: string | null;
  avatarOpen: boolean;
  setAvatarOpen: (next: boolean) => void;
  onLogout: () => void;
};

export default function UserMenuDesktop({
  user,
  avatarUrl,
  avatarOpen,
  setAvatarOpen,
  onLogout,
}: UserMenuDesktopProps) {
  return (
    <div className="relative">
      <button onClick={() => setAvatarOpen(!avatarOpen)}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={36}
            height={36}
            loading="eager"
            className="h-9 w-9 cursor-pointer rounded-full object-cover object-center"
          />
        ) : (
          <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-sandstone/40 text-sm font-bold text-sandstone hover:bg-sandstone hover:text-background">
            {user.email?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </button>

      {avatarOpen ? (
        <div className="absolute right-0 z-50 mt-3 flex w-48 flex-col rounded-lg border border-sandstone/40 bg-background py-3 text-sandstone shadow-lg">
          <Link
            href="/account"
            className="px-4 py-2 hover:bg-sandstone/10 hover:underline underline-offset-4"
            onClick={() => setAvatarOpen(false)}
          >
            Account
          </Link>

          <Link
            href="/orders"
            className="px-4 py-2 hover:bg-sandstone/10 hover:underline underline-offset-4"
            onClick={() => setAvatarOpen(false)}
          >
            Orders
          </Link>

          <button
            onClick={onLogout}
            className="px-4 py-2 text-left hover:bg-sandstone/10"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}