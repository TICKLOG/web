"use server";

import { and, eq, isNotNull, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { minecraftAccounts, teamMembers, users } from "@/db/schema";
import { currentTeamUser } from "@/lib/team";

// Adds the TickLog user who has this Minecraft account linked. Only team
// members can change the team.
export async function addTeamMember(name: string): Promise<{ error?: string }> {
  if (!(await currentTeamUser())) return { error: "You're not on the team." };
  const [account] = await db
    .select({ userId: minecraftAccounts.userId })
    .from(minecraftAccounts)
    .innerJoin(users, eq(users.id, minecraftAccounts.userId))
    .where(
      and(
        eq(sql`lower(${minecraftAccounts.name})`, name.trim().toLowerCase()),
        isNotNull(users.authId),
      ),
    );
  if (!account) return { error: "No TickLog account has this player linked." };
  const added = await db
    .insert(teamMembers)
    .values({ userId: account.userId })
    .onConflictDoNothing()
    .returning({ userId: teamMembers.userId });
  if (added.length === 0) return { error: "Already on the team." };
  refresh();
  return {};
}

// Removes a member. Nobody can remove themselves, so the team never locks
// itself out.
export async function removeTeamMember(userId: string) {
  const me = await currentTeamUser();
  if (!me || me === userId) return;
  await db.delete(teamMembers).where(eq(teamMembers.userId, userId));
  refresh();
}
