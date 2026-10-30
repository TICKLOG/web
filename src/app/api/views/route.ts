import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { minecraftAccounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { addView } from "@/lib/views";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const BOT = /bot|crawl|spider|slurp|preview|headless|curl|wget|python|httpclient/i;

// Sent by the player page once it's open in a browser (so prefetches and
// crawlers don't count). Each viewer counts once a month; the account's owner
// doesn't count on their own page. Returns this month's views.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const uuid = typeof body?.uuid === "string" ? body.uuid : "";
  if (!UUID.test(uuid)) return Response.json({ error: "Bad request" }, { status: 400 });
  if (BOT.test(request.headers.get("user-agent") ?? "")) return Response.json({ counted: false });

  const user = (await getCurrentUser())?.user;
  if (user) {
    const [own] = await db
      .select({ uuid: minecraftAccounts.uuid })
      .from(minecraftAccounts)
      .where(and(eq(minecraftAccounts.uuid, uuid), eq(minecraftAccounts.userId, user.id)));
    if (own) return Response.json({ counted: false });
  }
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "";
  const viewer = user ? `user:${user.id}` : `ip:${ip}`;
  if (!user && !ip) return Response.json({ counted: false });
  return Response.json({ counted: true, views: await addView(uuid, viewer) });
}
