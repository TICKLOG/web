import { and, eq, isNull } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { deleteLegacySession, getLegacySession } from "@/lib/auth/session";
import { createSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ticklog.net";
  const done = (error?: string) =>
    NextResponse.redirect(new URL(error ? `/?login=${error}` : "/", siteUrl));

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return done("cancelled");

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("Discord sign-in failed:", error);
    return done("failed");
  }
  const authId = data.user.id;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.authId, authId));
  if (!existing) {
    // Users from the earlier Microsoft-only login keep their linked accounts.
    const legacy = await getLegacySession();
    const attached = legacy
      ? await db
          .update(users)
          .set({ authId })
          .where(and(eq(users.id, legacy.userId), isNull(users.authId)))
          .returning({ id: users.id })
      : [];
    if (attached.length === 0) await db.insert(users).values({ authId });
  }
  await deleteLegacySession();
  return done();
}
