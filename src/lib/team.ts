import { asc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { minecraftAccounts, teamMembers, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type TeamMember = {
  userId: string;
  addedAt: Date;
  discord: { name: string; avatarUrl: string | null };
  accounts: { uuid: string; name: string }[];
};

// The signed-in user's id if they're on the team, else null. Cached per
// request.
export const currentTeamUser = cache(async () => {
  const user = (await getCurrentUser())?.user;
  if (!user) return null;
  const [row] = await db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id));
  return row ? user.id : null;
});

// All team members with their Discord name and avatar (from Supabase Auth)
// and linked Minecraft accounts, longest-serving first.
export async function loadTeam(): Promise<TeamMember[]> {
  const rows = await db
    .select({
      userId: teamMembers.userId,
      addedAt: teamMembers.addedAt,
      authId: users.authId,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .orderBy(asc(teamMembers.addedAt));
  if (rows.length === 0) return [];

  const admin = createSupabaseAdminClient();
  const [accounts, discord] = await Promise.all([
    db
      .select({
        userId: minecraftAccounts.userId,
        uuid: minecraftAccounts.uuid,
        name: minecraftAccounts.name,
      })
      .from(minecraftAccounts)
      .where(
        inArray(
          minecraftAccounts.userId,
          rows.map((r) => r.userId),
        ),
      )
      .orderBy(
        asc(minecraftAccounts.position),
        asc(minecraftAccounts.linkedAt),
      ),
    Promise.all(
      rows.map(async (r) => {
        if (!r.authId) return null;
        const { data } = await admin.auth.admin.getUserById(r.authId);
        const meta = (data.user?.user_metadata ?? {}) as {
          full_name?: string;
          avatar_url?: string;
          custom_claims?: { global_name?: string };
        };
        return {
          name:
            meta.custom_claims?.global_name ?? meta.full_name ?? "Discord User",
          avatarUrl: meta.avatar_url ?? null,
        };
      }),
    ),
  ]);

  return rows.map((r, i) => ({
    userId: r.userId,
    addedAt: r.addedAt,
    discord: discord[i] ?? { name: "Discord User", avatarUrl: null },
    accounts: accounts
      .filter((a) => a.userId === r.userId)
      .map(({ uuid, name }) => ({ uuid, name })),
  }));
}
