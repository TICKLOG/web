import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";

// Starts Discord sign-in through Supabase Auth (PKCE; the verifier is stored
// in a cookie by the Supabase client).
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ticklog.net";
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${siteUrl}/auth/discord/callback`,
      scopes: "identify",
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) {
    console.error("Discord sign-in failed to start:", error);
    return NextResponse.redirect(new URL("/?login=failed", siteUrl));
  }
  return NextResponse.redirect(data.url);
}
