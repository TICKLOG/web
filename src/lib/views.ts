import { createHmac } from "node:crypto";
import { and, count, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { profileViews } from "@/db/schema";

// First day of the current month (UTC), the key views are counted under.
const thisMonth = sql`date_trunc('month', now() at time zone 'utc')::date`;

// Unique viewers of a player this month.
export async function loadViews(uuid: string) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(profileViews)
    .where(and(eq(profileViews.uuid, uuid), eq(profileViews.month, thisMonth)));
  return n;
}

// Counts a view once per viewer and month. `viewer` is the TickLog user id or
// the IP; only an HMAC of it is stored, and only for the current month (see
// the privacy policy).
export async function addView(uuid: string, viewer: string) {
  const hash = createHmac("sha256", process.env.VIEW_SECRET!).update(viewer).digest("hex");
  await db.delete(profileViews).where(lt(profileViews.month, thisMonth));
  await db.insert(profileViews).values({ uuid, month: thisMonth, viewer: hash }).onConflictDoNothing();
  return loadViews(uuid);
}
