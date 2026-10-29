import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { modSessions, playtime, servers } from "@/db/schema";
import { pingStatus } from "@/lib/server-ping";
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

// How long a ping result is trusted before the server is checked again.
const REACHABLE_FOR = 7 * 24 * 3600_000;
const UNREACHABLE_FOR = 3600_000;

// New addresses a token may have checked: 5 per 10 minutes, so random names
// can't make us ping the whole internet.
const checks = new Map<string, number[]>();
function mayCheck(token: string) {
  const now = Date.now();
  const recent = (checks.get(token) ?? []).filter((t) => t > now - 600_000);
  if (checks.size > 10_000) checks.clear();
  checks.set(token, recent);
  if (recent.length >= 5) return false;
  recent.push(now);
  return true;
}

// The address to list the time under, or "" to only count it as server time:
// IPs (private servers), local names and addresses no Minecraft server
// answers on aren't listed. Realms has no address and is kept as "realms".
export async function verifiedServer(token: string, address: string) {
  if (!address || address === "realms") return address;
  const host = address.replace(/:\d+$/, "");
  if (address.startsWith("[") || isIP(host) || !host.includes(".")) return "";
  const [known] = await db.select().from(servers).where(eq(servers.address, address));
  if (known) {
    const age = Date.now() - known.checkedAt.getTime();
    if (age < (known.reachable ? REACHABLE_FOR : UNREACHABLE_FOR)) {
      return known.reachable ? address : "";
    }
  }
  if (!mayCheck(token)) return known?.reachable ? address : "";
  const reachable = (await pingStatus(address)) !== null;
  await db
    .insert(servers)
    .values({ address, reachable })
    .onConflictDoUpdate({ target: servers.address, set: { reachable, checkedAt: sql`now()` } });
  return reachable ? address : "";
}

// Whether an address passed the ping check (for server icons).
export async function isReachable(address: string) {
  const [row] = await db
    .select({ reachable: servers.reachable })
    .from(servers)
    .where(eq(servers.address, address));
  return row?.reachable ?? false;
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
      .having(gte(total, 60))
      .orderBy(desc(total))
      .limit(3),
  ]);
  const of = (k: Kind) => kinds.find((r) => r.kind === k)?.seconds ?? 0;
  return { server: of("server"), singleplayer: of("singleplayer"), launcher: of("launcher"), servers };
}
