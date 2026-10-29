import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSupabaseClient } from "@/lib/supabase/server";

export type DiscordProfile = { name: string; username: string | null; avatarUrl: string | null };

// The signed-in Discord identity and its TickLog user (null until the first
// callback created it). Cached per request.
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  // Discord metadata as stored by Supabase Auth.
  const meta = (claims.user_metadata ?? {}) as {
    full_name?: string;
    avatar_url?: string;
    custom_claims?: { global_name?: string };
  };
  const discord: DiscordProfile = {
    name: meta.custom_claims?.global_name ?? meta.full_name ?? "Discord User",
    username: meta.full_name ?? null,
    avatarUrl: meta.avatar_url ?? null,
  };

  const [user] = await db.select().from(users).where(eq(users.authId, claims.sub));
  return { authId: claims.sub, user: user ?? null, discord };
});
