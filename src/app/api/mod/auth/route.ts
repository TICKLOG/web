import { randomBytes } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { modChallenges, modSessions } from "@/db/schema";
import { dashUuid } from "@/lib/mojang";
import { hashToken } from "@/lib/playtime";

// Step 2 of the mod login: Mojang confirms the player joined our server id,
// which only the account owner can do. Returns a token for heartbeats and
// replaces any older one for this account.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const serverId = typeof body?.serverId === "string" ? body.serverId : "";
  const [challenge] = await db
    .delete(modChallenges)
    .where(and(eq(modChallenges.serverId, serverId), gt(modChallenges.createdAt, sql`now() - interval '2 minutes'`)))
    .returning();
  if (!challenge) return Response.json({ error: "Unknown or expired challenge" }, { status: 401 });

  const url = new URL("https://sessionserver.mojang.com/session/minecraft/hasJoined");
  url.searchParams.set("username", challenge.name);
  url.searchParams.set("serverId", serverId);
  const res = await fetch(url, { cache: "no-store" });
  const profile = res.status === 200 ? ((await res.json()) as { id: string }) : null;
  if (!profile || dashUuid(profile.id) !== challenge.uuid) {
    return Response.json({ error: "Not verified by Mojang" }, { status: 401 });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  await db
    .insert(modSessions)
    .values({ uuid: challenge.uuid, tokenHash })
    .onConflictDoUpdate({
      target: modSessions.uuid,
      set: { tokenHash, lastBeatAt: null, createdAt: sql`now()` },
    });
  return Response.json({ token });
}
