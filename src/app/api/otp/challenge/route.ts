import { randomBytes } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { modChallenges } from "@/db/schema";
import { NAME } from "@/lib/mojang";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Per-IP limit so the table can't be flooded: 10 challenges a minute.
const hits = new Map<string, { count: number; reset: number }>();
function allow(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    if (hits.size > 10_000) hits.clear();
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  return ++h.count <= 10;
}

// Step 1 of the mod login: hands out a server id for the game to join through
// Mojang's session server.
export async function POST(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "";
  if (!allow(ip)) return Response.json({ error: "Too many requests" }, { status: 429 });
  const body = await request.json().catch(() => null);
  const uuid = typeof body?.uuid === "string" ? body.uuid.toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name : "";
  if (!UUID.test(uuid) || !NAME.test(name)) {
    return Response.json({ error: "Invalid player" }, { status: 400 });
  }
  const serverId = randomBytes(16).toString("hex");
  await db.delete(modChallenges).where(lt(modChallenges.createdAt, sql`now() - interval '2 minutes'`));
  await db.insert(modChallenges).values({ serverId, uuid, name });
  return Response.json({ serverId });
}
