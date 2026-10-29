import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  MICROSOFT_AUTHORIZE_URL,
  MICROSOFT_SCOPE,
  OAUTH_COOKIE,
} from "@/lib/auth/minecraft";

// Starts Microsoft sign-in to link a Minecraft account to the Discord login.
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ticklog.net";
  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const url = new URL(MICROSOFT_AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${siteUrl}/auth/microsoft/callback`,
    scope: MICROSOFT_SCOPE,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  (await cookies()).set(OAUTH_COOKIE, JSON.stringify({ state, verifier }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/auth/microsoft",
    maxAge: 10 * 60,
  });
  return NextResponse.redirect(url);
}
