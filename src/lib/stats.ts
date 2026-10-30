import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { hiddenServers, playtime, servers, stats } from "@/db/schema";

export const STAT_KEYS = [
  "walked",
  "flown",
  "broken",
  "placed",
  "deaths",
  "jumps",
  "mobKills",
  "playerKills",
] as const;
export type StatKey = (typeof STAT_KEYS)[number];
export type StatValues = Record<StatKey, number>;

// Most a player can reach per minute in survival, a bit above the vanilla
// limits: sprint-jumping (~7 blocks/s), elytra with rockets, instant mining,
// placing every 4 ticks, mob farms. Anything above is cut off, so made-up
// numbers from a modified client can't go far.
const PER_MINUTE: StatValues = {
  walked: 450,
  flown: 2400,
  broken: 1200,
  placed: 300,
  deaths: 10,
  jumps: 150,
  mobKills: 300,
  playerKills: 30,
};

export const emptyStats = (): StatValues =>
  Object.fromEntries(STAT_KEYS.map((k) => [k, 0])) as StatValues;

// The stats sent with a heartbeat, capped for the `seconds` it covers.
// Missing or invalid values count as 0 (older mods send none).
export function parseStats(input: unknown, seconds: number): StatValues {
  const values = emptyStats();
  if (!input || typeof input !== "object") return values;
  for (const k of STAT_KEYS) {
    const v = (input as Record<string, unknown>)[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    values[k] = Math.min(
      Math.floor(v),
      Math.floor((PER_MINUTE[k] * seconds) / 60),
    );
  }
  return values;
}

export type StatGroup = {
  kind: "singleplayer" | "server";
  server: string;
  values: StatValues;
};

// All-time stats per kind and server, for the filter on the player page.
// The filter lists every server the player has played on, most played first.
// Servers stay listed only when verified and not hidden by the player; their
// numbers still count towards "All" and "Servers" like playtime does.
export async function loadStats(
  uuid: string,
): Promise<{ groups: StatGroup[]; servers: string[] }> {
  const sum = (c: (typeof stats)[StatKey]) => sql<number>`sum(${c})::int`;
  const statRows = db
    .select({
      kind: stats.kind,
      server: stats.server,
      listed: sql<boolean>`bool_or(${servers.reachable} is true and ${hiddenServers.server} is null)`,
      walked: sum(stats.walked),
      flown: sum(stats.flown),
      broken: sum(stats.broken),
      placed: sum(stats.placed),
      deaths: sum(stats.deaths),
      jumps: sum(stats.jumps),
      mobKills: sum(stats.mobKills),
      playerKills: sum(stats.playerKills),
    })
    .from(stats)
    .leftJoin(servers, eq(servers.address, stats.server))
    .leftJoin(
      hiddenServers,
      and(
        eq(hiddenServers.uuid, stats.uuid),
        eq(hiddenServers.server, stats.server),
      ),
    )
    .where(eq(stats.uuid, uuid))
    .groupBy(stats.kind, stats.server);
  const played = db
    .select({ server: playtime.server })
    .from(playtime)
    .innerJoin(servers, eq(servers.address, playtime.server))
    .leftJoin(
      hiddenServers,
      and(
        eq(hiddenServers.uuid, playtime.uuid),
        eq(hiddenServers.server, playtime.server),
      ),
    )
    .where(
      and(
        eq(playtime.uuid, uuid),
        eq(playtime.kind, "server"),
        eq(servers.reachable, true),
        isNull(hiddenServers.server),
      ),
    )
    .groupBy(playtime.server)
    .orderBy(desc(sql`sum(${playtime.seconds})`));
  const [rows, playedRows] = await Promise.all([statRows, played]);

  const groups = rows.map(({ kind, server, listed, ...values }) => ({
    kind: kind as StatGroup["kind"],
    // Unlisted servers only count in the totals.
    server: listed ? server : "",
    values,
  }));
  const listed = rows
    .filter((r) => r.kind === "server" && r.listed && r.server)
    .map((r) => r.server);
  return {
    groups,
    servers: [...new Set([...playedRows.map((r) => r.server), ...listed])],
  };
}
