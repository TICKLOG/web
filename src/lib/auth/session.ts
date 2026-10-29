import { createHash } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";

// Sessions from the earlier Microsoft-only login. Only read once, to attach
// that user to their Discord login; new sessions come from Supabase Auth.

const SESSION_COOKIE = "ticklog_session";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getLegacySession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, sql`now()`)));
  return session ?? null;
}

// Call only from Route Handlers or Server Functions (it deletes a cookie).
export async function deleteLegacySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  cookieStore.delete(SESSION_COOKIE);
}
