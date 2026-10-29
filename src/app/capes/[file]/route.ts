import type { NextRequest } from "next/server";
import sharp from "sharp";

// GET /capes/<texture hash>.png: the front of a Mojang cape, cut from its
// texture and scaled up without smoothing.

const HASH = /^([0-9a-f]{32,64})\.png$/;

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/capes/[file]">,
) {
  const match = HASH.exec((await ctx.params).file);
  if (!match) return new Response("Not found", { status: 404 });

  const texture = await fetch(
    `https://textures.minecraft.net/texture/${match[1]}`,
  );
  if (!texture.ok) return new Response("Cape unavailable", { status: 502 });
  const image = Buffer.from(await texture.arrayBuffer());

  // Capes are 64×32 (some older ones 22×17); the front is 10×16 at (1, 1).
  const { width = 64 } = await sharp(image).metadata();
  const scale = width >= 64 ? width / 64 : 1;
  const front = await sharp(image)
    .extract({ left: scale, top: scale, width: 10 * scale, height: 16 * scale })
    .toBuffer();
  const png = await sharp(front)
    .resize(60, 96, { kernel: "nearest" })
    .png()
    .toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // A texture hash never changes its image.
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  });
}
