import { cacheLife } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type SiteStats = {
  players: number;
  hours: number;
  servers: number;
  registered: number;
};

// Totals for the home page. Refreshed every few minutes, so the page stays
// fast.
export async function loadSiteStats(): Promise<SiteStats> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  const [row] = await db.execute<{
    players: number;
    seconds: number;
    servers: number;
    registered: number;
  }>(sql`
    select
      (select count(distinct uuid) from ticklog.playtime)::int as players,
      (select coalesce(sum(seconds), 0) from ticklog.playtime)::bigint::float8 as seconds,
      -- Only verified public servers, like on player pages.
      (select count(distinct p.server) from ticklog.playtime p
        join ticklog.servers s on s.address = p.server and s.reachable)::int as servers,
      (select count(*) from ticklog.minecraft_accounts)::int as registered
  `);
  return {
    players: row.players,
    hours: Math.floor(row.seconds / 3600),
    servers: row.servers,
    registered: row.registered,
  };
}
