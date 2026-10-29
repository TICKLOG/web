"use server";

import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";

// Likes or unlikes a player for the signed-in user. Returns the new state, or
// null when nobody is signed in with Discord.
export async function toggleLike(uuid: string) {
  const user = (await getCurrentUser())?.user;
  if (!user) return null;
  const where = and(eq(likes.uuid, uuid), eq(likes.userId, user.id));
  const removed = await db.delete(likes).where(where).returning();
  if (removed.length === 0) await db.insert(likes).values({ uuid, userId: user.id }).onConflictDoNothing();
  const [{ n }] = await db.select({ n: count() }).from(likes).where(eq(likes.uuid, uuid));
  return { liked: removed.length === 0, count: n };
}
