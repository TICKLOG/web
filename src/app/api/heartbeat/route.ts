import { creditBeat, KINDS, type Kind, normalizeServer } from "@/lib/playtime";

// Sent by the mod every 30 seconds (and when the player switches between
// launcher, singleplayer and servers) for the stretch that just ended.
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const body = await request.json().catch(() => null);
  const kind = KINDS.find((k) => k === body?.kind) as Kind | undefined;
  if (!token || !kind) return Response.json({ error: "Bad request" }, { status: 400 });
  const server = kind === "server" && typeof body.server === "string" ? normalizeServer(body.server) : "";
  if (!(await creditBeat(token, kind, server))) {
    return Response.json({ error: "Unknown token" }, { status: 401 });
  }
  return Response.json({ ok: true });
}
