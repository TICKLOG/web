import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { getDomain } from "tldts";
import { and, desc, eq, gte, ne, notExists, sql } from "drizzle-orm";
import { db } from "@/db";
import { hiddenServers, modSessions, playerSettings, playtime, servers, stats } from "@/db/schema";
import { parseStats, STAT_KEYS } from "@/lib/stats";
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

// Hosts where every subdomain is someone else's server, so those keep their
// subdomain (xyz.aternos.me stays xyz.aternos.me).
const SHARED_HOSTS = new Set([
  "aternos.me",
  "minehut.gg",
  "exaroton.me",
  "falixsrv.me",
  "playit.gg",
  "joinmc.link",
  "e4mc.link",
  "feathermc.gg",
  "ploudos.me",
  "minefort.com",
  "serv.nu",
  "ngrok.io",
  "ngrok-free.app",
]);

// The name a server is listed under: its main domain, so mc.hypixel.net,
// play.hypixel.net and hypixel.net count as one server. The port is dropped.
export function serverName(host: string) {
  const domain = getDomain(host);
  if (!domain || SHARED_HOSTS.has(domain)) return host;
  return domain;
}

// The name to list the time under, or "" to only count it as server time:
// IPs (private servers), local names and addresses no Minecraft server
// answers on aren't listed. Realms has no address and is kept as "realms".
export async function verifiedServer(token: string, address: string) {
  if (!address || address === "realms") return address;
  const host = address.replace(/:\d+$/, "");
  if (address.startsWith("[") || isIP(host) || !host.includes(".")) return "";
  const name = serverName(host);
  const [known] = await db.select().from(servers).where(eq(servers.address, name));
  if (known) {
    const age = Date.now() - known.checkedAt.getTime();
    if (age < (known.reachable ? REACHABLE_FOR : UNREACHABLE_FOR)) {
      return known.reachable ? name : "";
    }
  }
  if (!mayCheck(token)) return known?.reachable ? name : "";
  const reachable = (await pingStatus(address)) !== null;
  const set = reachable ? { reachable, pingAddress: address } : { reachable };
  await db
    .insert(servers)
    .values({ address: name, ...set })
    .onConflictDoUpdate({ target: servers.address, set: { ...set, checkedAt: sql`now()` } });
  return reachable ? name : "";
}

// The address to ping for a listed server's icon, or null if it isn't one.
export async function iconAddress(name: string) {
  const [row] = await db
    .select({ reachable: servers.reachable, pingAddress: servers.pingAddress })
    .from(servers)
    .where(eq(servers.address, name));
  return row?.reachable ? (row.pingAddress ?? name) : null;
}

// Credits the time since the last beat (capped) to `kind`/`server` on today's
// UTC day. Returns false if the token is unknown or was replaced.
// Column name of a stat in SQL (mobKills -> mob_kills).
const snake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

// `rawStats` are the stats the mod counted since its last heartbeat; they're
// capped for the time credited (see lib/stats.ts).
export async function creditBeat(token: string, kind: Kind, server: string, rawStats?: unknown) {
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
      // Stats only happen in a world, never in the launcher.
      const values = parseStats(rawStats, seconds);
      if (kind !== "launcher" && STAT_KEYS.some((k) => values[k] > 0)) {
        await tx
          .insert(stats)
          .values({ uuid: session.uuid, day: now.toISOString().slice(0, 10), kind, server, ...values })
          .onConflictDoUpdate({
            target: [stats.uuid, stats.day, stats.kind, stats.server],
            set: Object.fromEntries(STAT_KEYS.map((k) => [k, sql`${stats[k]} + excluded.${sql.identifier(snake(k))}`])),
          });
      }
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

// Days in a row with at least a minute of playtime, ending today or
// yesterday (UTC), so the streak holds until the day is over.
export async function loadStreak(uuid: string) {
  const [row] = await db.execute<{ days: number }>(sql`
    with d as (
      select day from ${playtime} where uuid = ${uuid}
      group by day having sum(seconds) >= 60
    ),
    g as (select day, day - (row_number() over (order by day))::int as grp from d),
    island as (select min(day) as a, max(day) as b from g group by grp)
    select coalesce(max(b - a + 1), 0)::int as days from island
    where b >= (now() at time zone 'utc')::date - 1
  `);
  return row?.days ?? 0;
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
      .where(
        and(
          eq(playtime.uuid, uuid),
          eq(playtime.kind, "server"),
          ne(playtime.server, ""),
          notExists(
            db
              .select()
              .from(hiddenServers)
              .where(and(eq(hiddenServers.uuid, uuid), eq(hiddenServers.server, playtime.server))),
          ),
        ),
      )
      .groupBy(playtime.server)
      .having(gte(total, 60))
      .orderBy(desc(total))
      .limit(3),
  ]);
  const of = (k: Kind) => kinds.find((r) => r.kind === k)?.seconds ?? 0;
  return { server: of("server"), singleplayer: of("singleplayer"), launcher: of("launcher"), servers };
}

// Every listed server of a player (at least a minute), most played first, and
// whether the player hid it from their top servers.
export async function loadServers(uuid: string) {
  const total = sql<number>`sum(${playtime.seconds})::int`;
  const [rows, hidden] = await Promise.all([
    db
      .select({ server: playtime.server, seconds: total })
      .from(playtime)
      .where(and(eq(playtime.uuid, uuid), eq(playtime.kind, "server"), ne(playtime.server, "")))
      .groupBy(playtime.server)
      .having(gte(total, 60))
      .orderBy(desc(total)),
    db.select({ server: hiddenServers.server }).from(hiddenServers).where(eq(hiddenServers.uuid, uuid)),
  ]);
  const off = new Set(hidden.map((h) => h.server));
  return rows.map((r) => ({ ...r, hidden: off.has(r.server) }));
}

// Account settings shown on the player page: hidden profile and links.
export async function loadPlayerSettings(uuid: string) {
  const [row] = await db
    .select({
      hidden: playerSettings.hidden,
      twitch: playerSettings.twitch,
      youtube: playerSettings.youtube,
      x: playerSettings.x,
      discord: playerSettings.discord,
    })
    .from(playerSettings)
    .where(eq(playerSettings.uuid, uuid));
  return row ?? { hidden: false, twitch: null, youtube: null, x: null, discord: null };
}
