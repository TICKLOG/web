"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { hiddenServers, minecraftAccounts, playerSettings, playtime } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";

// Settings of a Minecraft account can only be changed by the user who has it
// linked.
async function ownsAccount(uuid: string) {
  const user = (await getCurrentUser())?.user;
  if (!user) return false;
  const [row] = await db
    .select({ uuid: minecraftAccounts.uuid })
    .from(minecraftAccounts)
    .where(and(eq(minecraftAccounts.uuid, uuid), eq(minecraftAccounts.userId, user.id)));
  return Boolean(row);
}

export async function setProfileHidden(uuid: string, hidden: boolean) {
  if (!(await ownsAccount(uuid))) return;
  await db
    .insert(playerSettings)
    .values({ uuid, hidden })
    .onConflictDoUpdate({ target: playerSettings.uuid, set: { hidden } });
  refresh();
}

export async function setServerHidden(uuid: string, server: string, hidden: boolean) {
  if (!(await ownsAccount(uuid))) return;
  if (hidden) await db.insert(hiddenServers).values({ uuid, server }).onConflictDoNothing();
  else await db.delete(hiddenServers).where(and(eq(hiddenServers.uuid, uuid), eq(hiddenServers.server, server)));
  refresh();
}

// Deletes all tracked playtime of the account; tracking goes on from zero.
export async function resetPlaytime(uuid: string) {
  if (!(await ownsAccount(uuid))) return;
  await db.delete(playtime).where(eq(playtime.uuid, uuid));
  await db.delete(hiddenServers).where(eq(hiddenServers.uuid, uuid));
  refresh();
}
