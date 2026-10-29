import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { minecraftAccounts } from "@/db/schema";
import {
  getMinecraftProfile,
  MICROSOFT_SCOPE,
  MICROSOFT_TOKEN_URL,
  MinecraftAuthError,
  type MinecraftProfile,
  OAUTH_COOKIE,
} from "@/lib/auth/minecraft";
import { getCurrentUser } from "@/lib/auth/user";
import { saveOwnedCapes } from "@/lib/capes";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ticklog.net";
  // Errors are passed to the home page as ?login=<code> for now.
  const done = (error?: string) =>
    NextResponse.redirect(new URL(error ? `/?login=${error}` : "/", siteUrl));

  // Minecraft accounts are linked to the Discord login, never signed in alone.
  const current = await getCurrentUser();
  if (!current?.user) return done("discord_required");

  const params = request.nextUrl.searchParams;
  const cookieStore = await cookies();
  const saved = cookieStore.get(OAUTH_COOKIE)?.value;
  cookieStore.delete({ name: OAUTH_COOKIE, path: "/auth/microsoft" });

  if (params.get("error")) return done("cancelled");
  const code = params.get("code");
  let oauth: { state: string; verifier: string } | null = null;
  try {
    oauth = saved ? JSON.parse(saved) : null;
  } catch {}
  if (!code || !oauth || oauth.state !== params.get("state")) {
    return done("invalid_state");
  }

  const tokenRes = await fetch(MICROSOFT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${siteUrl}/auth/microsoft/callback`,
      code_verifier: oauth.verifier,
      scope: MICROSOFT_SCOPE,
    }),
  });
  if (!tokenRes.ok) {
    console.error("Microsoft token exchange failed:", tokenRes.status, await tokenRes.text());
    return done("failed");
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  let profile: MinecraftProfile;
  try {
    profile = await getMinecraftProfile(access_token);
  } catch (error) {
    console.error("Minecraft sign-in failed:", error);
    return done(error instanceof MinecraftAuthError ? error.code : "failed");
  }

  const [existing] = await db
    .select({ userId: minecraftAccounts.userId })
    .from(minecraftAccounts)
    .where(eq(minecraftAccounts.uuid, profile.uuid));
  if (existing && existing.userId !== current.user.id) return done("already_linked");

  await db
    .insert(minecraftAccounts)
    .values({
      uuid: profile.uuid,
      userId: current.user.id,
      name: profile.name,
      // New accounts go to the end of the sidebar list.
      position: sql`(select coalesce(max(${minecraftAccounts.position}), -1) + 1 from ${minecraftAccounts} where ${minecraftAccounts.userId} = ${current.user.id})`,
    })
    .onConflictDoUpdate({
      target: minecraftAccounts.uuid,
      set: { name: profile.name, updatedAt: new Date() },
    });
  await saveOwnedCapes(profile.uuid, profile.capes);
  return done();
}
