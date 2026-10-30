import { connection, NextResponse } from "next/server";
import { iconAddress } from "@/lib/playtime";
import { pingFavicon } from "@/lib/server-ping";

// Icons this process already found, kept small; failures aren't kept, so a
// server that was down gets pinged again later.
const cache = new Map<string, Promise<string | null>>();
const CACHE_SIZE = 500;

// GET /server-icon?s=<address>: PNG icon of a Minecraft server, read from its
// server list ping. Cloudflare caches it for a day.
export async function GET(req: Request) {
  await connection();
  const server = (new URL(req.url).searchParams.get("s") ?? "")
    .trim()
    .toLowerCase();
  // Only servers the mod reported and that answered a ping, so this can't be
  // used to ping arbitrary addresses. Pinged at the address that answered
  // (mc.hypixel.net for hypixel.net).
  const address = /^[a-z0-9.\-_:[\]]{1,64}$/.test(server) ? await iconAddress(server) : null;
  if (!address) return new NextResponse(null, { status: 404 });
  let icon = cache.get(server);
  if (!icon) {
    if (cache.size >= CACHE_SIZE) cache.clear();
    icon = pingFavicon(address);
    cache.set(server, icon);
  }
  const png = await icon;
  if (!png) cache.delete(server);
  if (!png) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
  return new NextResponse(Buffer.from(png, "base64"), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
