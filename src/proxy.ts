import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (!hasSitePassword(request)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="TickLog", charset="UTF-8"' },
    });
  }
  return refreshSupabaseSession(request);
}

// Temporary browser password prompt (HTTP Basic Auth) for the whole site.
// Any username is accepted; only SITE_PASSWORD is checked. Unset it to go public.
function hasSitePassword(request: NextRequest): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) return true;
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;
  const decoded = atob(auth.slice("Basic ".length));
  return decoded.slice(decoded.indexOf(":") + 1) === password;
}

// Refreshes an expired Discord login before rendering, since Server
// Components can't write the new session cookies themselves.
async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
        },
      },
    },
  );
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
