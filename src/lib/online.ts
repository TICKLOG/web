import { cacheLife } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// A heartbeat comes every 30 seconds; a player missing for 90 is offline.
const ONLINE = sql`now() - interval '90 seconds'`;

let lastSample = 0;

// Records how many players are online right now in the current 10-minute
// window, keeping the most seen. Called on heartbeats, at most once a minute.
export async function sampleOnline() {
  if (Date.now() - lastSample < 60_000) return;
  lastSample = Date.now();
  await db.execute(sql`
    insert into ticklog.online_samples (at, players)
    select date_bin('10 minutes', now(), timestamptz '2000-01-01'), count(*)::int
    from ticklog.mod_sessions where last_beat_at > ${ONLINE}
    on conflict (at) do update set players = greatest(ticklog.online_samples.players, excluded.players)
  `);
}

// Players online right now; kept for 15 seconds, for the live count on the
// home page.
export async function countOnline() {
  "use cache";
  cacheLife({ stale: 10, revalidate: 15, expire: 60 });
  const [row] = await db.execute<{ online: number }>(sql`
    select count(*)::int as online from ticklog.mod_sessions where last_beat_at > ${ONLINE}
  `);
  return row.online;
}

export type OnlinePoint = { at: string; value: number };
export type OnlineData = {
  now: number;
  // Today and Week: most players online per 10 minutes / hour. Month and
  // Year: players who played per day.
  today: OnlinePoint[];
  week: OnlinePoint[];
  month: OnlinePoint[];
  year: OnlinePoint[];
};

// Every step from `from` to `to` (exclusive end at `to`), with the value of the
// matching row or 0.
function fill(
  rows: { at: Date | string; value: number }[],
  from: number,
  to: number,
  step: number,
) {
  const byTime = new Map(rows.map((r) => [new Date(r.at).getTime(), r.value]));
  const points: OnlinePoint[] = [];
  for (let t = from; t <= to; t += step)
    points.push({ at: new Date(t).toISOString(), value: byTime.get(t) ?? 0 });
  return points;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// The online count and its history for the home page. Refreshed every
// minute, so the page stays fast.
export async function loadOnline(): Promise<OnlineData> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  const [[{ online }], tenMinutes, hours, days] = await Promise.all([
    db.execute<{ online: number }>(sql`
      select count(*)::int as online from ticklog.mod_sessions where last_beat_at > ${ONLINE}
    `),
    db.execute<{ at: Date; value: number }>(sql`
      select at, players as value from ticklog.online_samples where at > now() - interval '1 day'
    `),
    db.execute<{ at: Date; value: number }>(sql`
      select date_trunc('hour', at) as at, max(players)::int as value from ticklog.online_samples
      where at > now() - interval '7 days' group by 1
    `),
    db.execute<{ at: string; value: number }>(sql`
      select day::text || 'T00:00:00Z' as at, count(distinct uuid)::int as value from ticklog.playtime
      where day > (now() at time zone 'utc')::date - 365 group by day
    `),
  ]);
  const now = Date.now();
  const tenMin = Math.floor(now / (10 * MINUTE)) * 10 * MINUTE;
  const hour = Math.floor(now / HOUR) * HOUR;
  const day = Math.floor(now / DAY) * DAY;
  const dayRows = [...days];
  return {
    now: online,
    today: fill(
      [...tenMinutes],
      tenMin - DAY + 10 * MINUTE,
      tenMin,
      10 * MINUTE,
    ),
    week: fill([...hours], hour - 7 * DAY + HOUR, hour, HOUR),
    month: fill(dayRows, day - 29 * DAY, day, DAY),
    year: fill(dayRows, day - 364 * DAY, day, DAY),
  };
}
