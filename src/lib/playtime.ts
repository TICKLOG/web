import { createHash } from "node:crypto";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { modSessions, playtime } from "@/db/schema";
import type { BreakdownData } from "@/components/breakdown";

// The mod beats every 30s; a longer gap (game frozen, offline) is not credited
// in full, so nobody can claim time they didn't send beats for.
const MAX_CREDIT = 60;

export const KINDS = ["launcher", "singleplayer", "server"] as const;
export type Kind = (typeof KINDS)[number];

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Server address as the player typed it, normalized so "Hypixel.net",
// "hypixel.net." and "hypixel.net:25565" count as one server.
export function normalizeServer(address: string) {
  const s = address.trim().toLowerCase().replace(/\.$/, "").replace(/:25565$/, "");
  return s.length <= 253 && /^[a-z0-9._:\-[\]]+$/.test(s) ? s : "";
}

// Credits the time since the last beat (capped) to `kind`/`server` on today's
// UTC day. Returns false if the token is unknown or was replaced.
export async function creditBeat(token: string, kind: Kind, server: string) {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .select({ uuid: modSessions.uuid, lastBeatAt: modSessions.lastBeatAt })
      .from(modSessions)
      .where(eq(modSessions.tokenHash, hashToken(token)))
      .for("update");
    if (!session) return false;
    const now = new Date();
    const seconds = session.lastBeatAt
      ? Math.min(MAX_CREDIT, Math.max(0, Math.round((now.getTime() - session.lastBeatAt.getTime()) / 1000)))
      : 0;
    await tx.update(modSessions).set({ lastBeatAt: now }).where(eq(modSessions.uuid, session.uuid));
    if (seconds > 0) {
      await tx
        .insert(playtime)
        .values({ uuid: session.uuid, day: now.toISOString().slice(0, 10), kind, server, seconds })
        .onConflictDoUpdate({
          target: [playtime.uuid, playtime.day, playtime.kind, playtime.server],
          set: { seconds: sql`${playtime.seconds} + excluded.seconds` },
        });
    }
    return true;
  });
}

// Playtime per day over the last year ("YYYY-MM-DD" -> seconds) for the heatmap.
export async function loadDays(uuid: string) {
  const rows = await db
    .select({ day: playtime.day, seconds: sql<number>`sum(${playtime.seconds})::int` })
    .from(playtime)
    .where(and(eq(playtime.uuid, uuid), gte(playtime.day, sql`current_date - 371`)))
    .groupBy(playtime.day);
  return new Map(rows.map((r) => [r.day, r.seconds]));
}

// Totals per kind and the top three servers.
export async function loadBreakdown(uuid: string): Promise<BreakdownData> {
  const total = sql<number>`sum(${playtime.seconds})::int`;
  const [kinds, servers] = await Promise.all([
    db
      .select({ kind: playtime.kind, seconds: total })
      .from(playtime)
      .where(eq(playtime.uuid, uuid))
      .groupBy(playtime.kind),
    db
      .select({ server: playtime.server, seconds: total })
      .from(playtime)
      .where(and(eq(playtime.uuid, uuid), eq(playtime.kind, "server"), ne(playtime.server, "")))
      .groupBy(playtime.server)
      .orderBy(desc(total))
      .limit(3),
  ]);
  const of = (k: Kind) => kinds.find((r) => r.kind === k)?.seconds ?? 0;
  return { server: of("server"), singleplayer: of("singleplayer"), launcher: of("launcher"), servers };
}
