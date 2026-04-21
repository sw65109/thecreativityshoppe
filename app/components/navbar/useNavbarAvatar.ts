"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export function useNavbarAvatar(user: User | null) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAvatar() {
      if (!user) {
        setAvatarUrl(null);
        return;
      }

      const metadataAvatar =
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null;

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setAvatarUrl(metadataAvatar);
        return;
      }

      setAvatarUrl(data?.avatar_url ?? metadataAvatar);
    }

    void loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { avatarUrl };
}