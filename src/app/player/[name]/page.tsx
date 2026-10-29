import { and, eq, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";
import { Badges } from "@/components/badges";
import { Breakdown } from "@/components/breakdown";
import { CapePreviewProvider } from "@/components/cape-preview";
import { Capes } from "@/components/capes";
import { ComingSoon } from "@/components/coming-soon";
import { CopyButton } from "@/components/copy-button";
import { Heatmap } from "@/components/heatmap";
import { Icon } from "@/components/icon";
import { PlayerSkin } from "@/components/player-skin";
import { db } from "@/db";
import { minecraftAccounts, playerBadges, users } from "@/db/schema";
import { BADGES } from "@/lib/badges";
import { loadCapes, rememberCape } from "@/lib/capes";
import { locatorColor } from "@/lib/minecraft";
import { fetchTextures, lookupPlayer } from "@/lib/mojang";
import { loadBreakdown, loadDays } from "@/lib/playtime";

const rise =
  "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

export async function generateMetadata({
  params,
}: PageProps<"/player/[name]">): Promise<Metadata> {
  const profile = await lookupPlayer((await params).name);
  return { title: profile?.name ?? "Player Not Found" };
}

// Whether the account is linked to a TickLog user with Discord.
async function isLinked(uuid: string) {
  const [row] = await db
    .select({ uuid: minecraftAccounts.uuid })
    .from(minecraftAccounts)
    .innerJoin(users, eq(users.id, minecraftAccounts.userId))
    .where(and(eq(minecraftAccounts.uuid, uuid), isNotNull(users.authId)));
  return Boolean(row);
}

// The player's badges, in the order of BADGES.
async function loadBadges(uuid: string) {
  const rows = await db
    .select({ badge: playerBadges.badge })
    .from(playerBadges)
    .where(eq(playerBadges.uuid, uuid));
  const has = new Set(rows.map((r) => r.badge));
  return BADGES.filter((b) => has.has(b.id));
}

// Public player profile at /player/{name} (lowercase).
export default async function PlayerPage({
  params,
}: PageProps<"/player/[name]">) {
  const { name } = await params;
  const profile = await lookupPlayer(name);
  if (!profile)
    return (
      <ComingSoon
        title="Player Not Found"
        subtitle={`No Minecraft player is named ${name}.`}
      />
    );
  const [linked, textures, badges, days, breakdown] = await Promise.all([
    isLinked(profile.uuid),
    fetchTextures(profile.uuid),
    loadBadges(profile.uuid),
    loadDays(profile.uuid),
    loadBreakdown(profile.uuid),
  ]);
  const color = locatorColor(profile.uuid);
  // Searched players keep every cape they were seen wearing.
  if (textures?.cape)
    await rememberCape(profile.uuid, textures.cape).catch(console.error);
  const capes = await loadCapes(profile.uuid);

  return (
    <main className="min-w-0 flex-1 px-10 pt-[30px] pb-10">
      <div className={rise}>
        <h1 className="flex items-start gap-1 text-5xl font-extrabold tracking-tight text-heading">
          {profile.name}
          {linked && (
            <span title="Linked Account" className="inline-flex shrink-0">
              <Icon className="size-5 text-sky-500">
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                <path d="m9 12 2 2 4-4" />
              </Icon>
            </span>
          )}
        </h1>
        <div className="mt-2 flex items-center gap-1 font-mono text-[13px] whitespace-nowrap text-search-text">
          {profile.uuid}
          <CopyButton text={profile.uuid} />
        </div>
      </div>

      <div className="mt-6 flex items-start gap-6">
        {/* Capes clicked or hovered in the list show on the 3D skin. */}
        <CapePreviewProvider>
          <div className="w-80 shrink-0">
            <div
              className={`relative flex w-80 flex-col items-center overflow-hidden rounded-[12px] border border-search-border bg-search ${rise} [animation-delay:100ms]`}
            >
              <p className="pointer-events-none absolute top-4 left-4 z-30 text-[12px] font-semibold tracking-wider text-search-text uppercase">
                Skin
              </p>
              <PlayerSkin textures={textures} />
              {/* The player's locator bar color. */}
              <div
                className="pointer-events-none absolute inset-x-4 bottom-4 z-30 flex items-center gap-3 font-mono text-[12px]"
                style={{ color }}
              >
                <span className="h-px flex-1 bg-current" />
                <span className="text-search-text uppercase">{color}</span>
                <span className="h-px flex-1 bg-current" />
              </div>
            </div>

            <Capes
              capes={capes}
              className={`mt-4 ${rise} [animation-delay:150ms]`}
            />
            <Badges
              badges={badges}
              className={`mt-4 ${rise} [animation-delay:150ms]`}
            />
          </div>
        </CapePreviewProvider>

        {/* As tall as the skin box (480px canvas plus its border). */}
        <div className="flex h-[482px] w-fit min-w-0 flex-col gap-4">
          <Heatmap
            data={days}
            accent={color}
            className={`max-w-full min-w-0 ${rise} [animation-delay:150ms]`}
          />
          <Breakdown
            accent={color}
            data={breakdown}
            className={`min-h-0 flex-1 ${rise} [animation-delay:200ms]`}
          />
        </div>
      </div>
    </main>
  );
}
