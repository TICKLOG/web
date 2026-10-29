import type { NextRequest } from "next/server";
import sharp from "sharp";
import { STEVE_SKIN, fetchTextures } from "@/lib/mojang";

// GET /heads/<uuid>.png: the player's face (plus hat layer) cut from their
// Mojang skin texture, scaled to 64px without smoothing. Used instead of
// third-party head services, which can serve stale skins.

const UUID = /^([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})\.png$/i;

export async function GET(_request: NextRequest, ctx: RouteContext<"/heads/[file]">) {
  const match = UUID.exec((await ctx.params).file);
  if (!match) return new Response("Not found", { status: 404 });
  const uuid = match.slice(1).join("").toLowerCase();

  const texture = await fetch((await fetchTextures(uuid))?.skin ?? STEVE_SKIN);
  if (!texture.ok) return new Response("Skin unavailable", { status: 502 });
  const skin = Buffer.from(await texture.arrayBuffer());

  const face = await sharp(skin).extract({ left: 8, top: 8, width: 8, height: 8 }).toBuffer();
  const hat = await sharp(skin).extract({ left: 40, top: 8, width: 8, height: 8 }).toBuffer();
  const head = await sharp(face)
    .composite([{ input: hat }])
    .png()
    .toBuffer()
    .then((png) => sharp(png).resize(64, 64, { kernel: "nearest" }).png().toBuffer());

  return new Response(new Uint8Array(head), {
    headers: {
      "Content-Type": "image/png",
      // Skins rarely change; also lets Cloudflare cache the .png.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
