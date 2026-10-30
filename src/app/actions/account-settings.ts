"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { hiddenServers, minecraftAccounts, playerSettings, playtime, stats } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { parseDiscord, parseTwitch, parseX, parseYoutube } from "@/lib/links";

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

const PARSE = { twitch: parseTwitch, youtube: parseYoutube, x: parseX, discord: parseDiscord };
const INVALID = {
  twitch: "That's not a Twitch channel.",
  youtube: "That's not a YouTube handle.",
  x: "That's not an X handle.",
  discord: "That's not a Discord invite.",
};

// Saves one link (saved as you type); returns the stored name or an error.
export async function setLink(uuid: string, key: keyof typeof PARSE, input: string) {
  if (!(await ownsAccount(uuid)) || !(key in PARSE)) return { error: "Not your account." };
  const value = PARSE[key](input);
  if (value === null) return { error: INVALID[key] };
  await db
    .insert(playerSettings)
    .values({ uuid, [key]: value || null })
    .onConflictDoUpdate({ target: playerSettings.uuid, set: { [key]: value || null } });
  refresh();
  return { value };
}

// Deletes all tracked stats of the account, playtime included; tracking goes
// on from zero.
export async function resetStats(uuid: string) {
  if (!(await ownsAccount(uuid))) return;
  await db.delete(playtime).where(eq(playtime.uuid, uuid));
  await db.delete(stats).where(eq(stats.uuid, uuid));
  await db.delete(hiddenServers).where(eq(hiddenServers.uuid, uuid));
  refresh();
}
