import { lookupPlayer } from "@/lib/mojang";

// Whether a player exists, for the search border. A plain request instead of a
// server action, which would hold back the navigation to the player page.
// Runs on the server: Mojang's API doesn't allow browser requests (CORS).
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name") ?? "";
  return Response.json({ found: Boolean(await lookupPlayer(name)) });
}
