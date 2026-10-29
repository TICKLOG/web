"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { hiddenServers, minecraftAccounts, playerSettings, playtime } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { parseDiscord, parseTwitch, parseYoutube } from "@/lib/links";

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

// Saves the Twitch, YouTube and Discord links; returns which one is invalid.
export async function setLinks(uuid: string, input: { twitch: string; youtube: string; discord: string }) {
  if (!(await ownsAccount(uuid))) return { error: "Not your account." };
  const twitch = parseTwitch(input.twitch);
  const youtube = parseYoutube(input.youtube);
  const discord = parseDiscord(input.discord);
  if (twitch === null) return { error: "That's not a Twitch channel." };
  if (youtube === null) return { error: "That's not a YouTube handle." };
  if (discord === null) return { error: "That's not a Discord username." };
  const links = { twitch: twitch || null, youtube: youtube || null, discord: discord || null };
  await db
    .insert(playerSettings)
    .values({ uuid, ...links })
    .onConflictDoUpdate({ target: playerSettings.uuid, set: links });
  refresh();
  return { links };
}

// Deletes all tracked playtime of the account; tracking goes on from zero.
export async function resetPlaytime(uuid: string) {
  if (!(await ownsAccount(uuid))) return;
  await db.delete(playtime).where(eq(playtime.uuid, uuid));
  await db.delete(hiddenServers).where(eq(hiddenServers.uuid, uuid));
  refresh();
}
