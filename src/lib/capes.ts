import { and, eq, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { capes, playerCapes } from "@/db/schema";

export type Cape = { hash: string; alias: string | null };

// Texture hash from a textures.minecraft.net URL.
export function capeHash(url: string) {
  return url.slice(url.lastIndexOf("/") + 1);
}

// Replaces the player's capes with the full list from their own Minecraft
// profile (read when the account is linked).
export async function saveOwnedCapes(
  uuid: string,
  owned: { url: string; alias: string }[],
) {
  const list = owned.map((c) => ({ hash: capeHash(c.url), alias: c.alias }));
  await db.transaction(async (tx) => {
    if (list.length > 0) {
      await tx
        .insert(capes)
        .values(list)
        .onConflictDoUpdate({
          target: capes.hash,
          set: { alias: sql`excluded.alias` },
        });
      await tx
        .insert(playerCapes)
        .values(list.map((c) => ({ uuid, hash: c.hash })))
        .onConflictDoNothing();
    }
    await tx.delete(playerCapes).where(
      list.length > 0
        ? and(
            eq(playerCapes.uuid, uuid),
            notInArray(
              playerCapes.hash,
              list.map((c) => c.hash),
            ),
          )
        : eq(playerCapes.uuid, uuid),
    );
  });
}

// Remembers a cape the player was seen wearing.
export async function rememberCape(uuid: string, url: string) {
  const hash = capeHash(url);
  await db.insert(capes).values({ hash }).onConflictDoNothing();
  await db.insert(playerCapes).values({ uuid, hash }).onConflictDoNothing();
}

export async function loadCapes(uuid: string): Promise<Cape[]> {
  return db
    .select({ hash: capes.hash, alias: capes.alias })
    .from(playerCapes)
    .innerJoin(capes, eq(capes.hash, playerCapes.hash))
    .where(eq(playerCapes.uuid, uuid))
    .orderBy(playerCapes.seenAt);
}
