"use server";

import { lookupPlayer } from "@/lib/mojang";

// The player's name as Mojang spells it, or null if no such player exists.
// Runs on the server: Mojang's API doesn't allow browser requests (CORS).
export async function findPlayer(name: string): Promise<string | null> {
  return (await lookupPlayer(name))?.name ?? null;
}
