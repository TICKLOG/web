import { cacheLife } from "next/cache";
import { cache } from "react";

// Minecraft names: 3–16 letters, digits or underscores (some old accounts
// have shorter ones, so 1 is allowed).
export const NAME = /^[A-Za-z0-9_]{1,16}$/;

// Mojang's 32-digit ids with dashes, like everywhere in our database.
export function dashUuid(id: string) {
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

export type MojangProfile = { uuid: string; name: string };

// The player as Mojang knows them (UUID with dashes, name as spelled by the
// player), or null if no such player exists. Kept for 10 minutes (names
// rarely change), unknown names for one, so the page doesn't wait for Mojang
// on every visit.
async function fetchPlayer(name: string): Promise<MojangProfile | null> {
  "use cache";
  const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`, { cache: "no-store" });
  if (res.status !== 200) {
    // Mojang errors (like rate limits) aren't kept at all.
    if (res.status !== 204 && res.status !== 404) throw new Error(`Mojang lookup failed: ${res.status}`);
    cacheLife({ stale: 60, revalidate: 60, expire: 60 });
    return null;
  }
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });
  const profile = (await res.json()) as { id: string; name: string };
  return { uuid: dashUuid(profile.id), name: profile.name };
}

export const lookupPlayer = cache(async (name: string): Promise<MojangProfile | null> => {
  if (!NAME.test(name)) return null;
  // Same entry for any spelling of the name.
  return fetchPlayer(name.toLowerCase()).catch(() => null);
});

export type SkinTextures = { skin: string; cape: string | null; model: "slim" | "default" };

// Players without a custom skin get Steve.
export const STEVE_SKIN =
  "https://textures.minecraft.net/texture/31f477eb1a7beee631c2ca64d06f8f68fa93a3386d04452ab27f43acdf1b60cb";

// The player's skin and cape (https URLs) from Mojang's session server, or
// null if the profile can't be loaded. Refreshed in the background after a
// minute, so a new skin shows on the next visit without waiting for Mojang.
export async function fetchTextures(uuid: string): Promise<SkinTextures | null> {
  return cachedTextures(uuid).catch(() => null);
}

async function cachedTextures(uuid: string): Promise<SkinTextures | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });
  const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid.replace(/-/g, "")}`, {
    cache: "no-store",
  });
  // Mojang errors (like rate limits) aren't kept; unknown profiles are.
  if (res.status === 204 || res.status === 404) return null;
  if (res.status !== 200) throw new Error(`Mojang profile failed: ${res.status}`);
  const profile = (await res.json()) as { properties: { name: string; value: string }[] };
  const textures = profile.properties.find((p) => p.name === "textures");
  if (!textures) return null;
  const decoded = JSON.parse(Buffer.from(textures.value, "base64").toString()) as {
    textures: { SKIN?: { url: string; metadata?: { model?: string } }; CAPE?: { url: string } };
  };
  const https = (url: string) => url.replace(/^http:/, "https:");
  const { SKIN, CAPE } = decoded.textures;
  return {
    skin: SKIN ? https(SKIN.url) : STEVE_SKIN,
    cape: CAPE ? https(CAPE.url) : null,
    model: SKIN?.metadata?.model === "slim" ? "slim" : "default",
  };
}

// The player's current name by UUID, or null if Mojang doesn't know it. Kept
// for an hour; for players we have no name stored for.
export async function fetchName(uuid: string): Promise<string | null> {
  return cachedName(uuid).catch(() => null);
}

async function cachedName(uuid: string): Promise<string | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid.replace(/-/g, "")}`, {
    cache: "no-store",
  });
  if (res.status === 204 || res.status === 404) return null;
  if (res.status !== 200) throw new Error(`Mojang profile failed: ${res.status}`);
  return ((await res.json()) as { name: string }).name;
}
