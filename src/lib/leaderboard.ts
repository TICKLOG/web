import { cacheLife } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { LeaderboardData, LeaderboardRow } from "@/components/leaderboard";
import { fetchName } from "./mojang";

// Players per list.
const LIMIT = 100;

// Days each range covers (UTC, like the playtime the mod sends).
const RANGES = {
  today: sql`day = (now() at time zone 'utc')::date`,
  month: sql`day >= date_trunc('month', now() at time zone 'utc')::date`,
  all: sql`true`,
};

// The most played players per range. Private profiles are left out. Refreshed
// every minute, so the page stays fast.
export async function loadLeaderboard(): Promise<LeaderboardData> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  const lists = await Promise.all(
    Object.entries(RANGES).map(async ([range, where]) => {
      const rows = await db.execute<{
        uuid: string;
        name: string | null;
        value: number;
      }>(sql`
        select p.uuid, m.name, sum(p.seconds)::int as value
        from ticklog.playtime p
        left join ticklog.minecraft_accounts m on m.uuid = p.uuid
        left join ticklog.player_settings s on s.uuid = p.uuid
        where ${where} and s.hidden is not true
        group by p.uuid, m.name
        having sum(p.seconds) >= 60
        order by value desc
        limit ${LIMIT}
      `);
      return [range, [...rows]] as const;
    }),
  );
  // Players without a linked account get their name from Mojang.
  const named = await Promise.all(
    lists.map(async ([range, rows]) => {
      const withNames = await Promise.all(
        rows.map(async (r) => ({ ...r, name: r.name ?? (await fetchName(r.uuid)) })),
      );
      return [
        `playtime:${range}`,
        withNames.filter((r): r is LeaderboardRow => r.name !== null),
      ] as const;
    }),
  );
  return Object.fromEntries(named);
}
