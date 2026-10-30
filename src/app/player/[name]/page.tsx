import { and, count, eq, isNotNull } from "drizzle-orm";
import { after } from "next/server";
import { Badges } from "@/components/badges";
import { Breakdown } from "@/components/breakdown";
import { CapePreviewProvider } from "@/components/cape-preview";
import { Capes } from "@/components/capes";
import { ComingSoon } from "@/components/coming-soon";
import { CopyButton } from "@/components/copy-button";
import { Heatmap } from "@/components/heatmap";
import { Icon } from "@/components/icon";
import { LikeButton } from "@/components/like-button";
import { PlayerLinks } from "@/components/player-links";
import { ProfileViews } from "@/components/profile-views";
import { PlayerSkin } from "@/components/player-skin";
import { Streak } from "@/components/streak";
import { db } from "@/db";
import { likes, minecraftAccounts, playerBadges, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { BADGES } from "@/lib/badges";
import { capeHash, loadCapes, rememberCape } from "@/lib/capes";
import { locatorColor } from "@/lib/minecraft";
import { loadViews } from "@/lib/views";
import { fetchTextures, lookupPlayer } from "@/lib/mojang";
import {
  loadPlayerSettings,
  loadBreakdown,
  loadDays,
  loadStreak,
} from "@/lib/playtime";

const rise =
  "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

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

// Like count and whether the signed-in user liked this player.
async function loadLikes(uuid: string) {
  const [[{ n }], current] = await Promise.all([
    db.select({ n: count() }).from(likes).where(eq(likes.uuid, uuid)),
    getCurrentUser(),
  ]);
  const user = current?.user;
  const [mine] = user
    ? await db
        .select({ uuid: likes.uuid })
        .from(likes)
        .where(and(eq(likes.uuid, uuid), eq(likes.userId, user.id)))
    : [];
  return { count: n, liked: Boolean(mine), loggedIn: Boolean(user) };
}

// Public player profile at /@{name} (lowercase), rewritten to this route.
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
  // Playtime is loaded alongside and dropped for private profiles (account
  // setting), which show "Hidden" instead.
  const [
    linked,
    textures,
    badges,
    liking,
    { hidden, ...links },
    views,
    capes,
    ...playtime
  ] = await Promise.all([
    isLinked(profile.uuid),
    fetchTextures(profile.uuid),
    loadBadges(profile.uuid),
    loadLikes(profile.uuid),
    loadPlayerSettings(profile.uuid),
    loadViews(profile.uuid),
    loadCapes(profile.uuid),
    loadDays(profile.uuid),
    loadBreakdown(profile.uuid),
    loadStreak(profile.uuid),
  ]);
  const [days, breakdown, streak] = hidden
    ? [
        new Map<string, number>(),
        { server: 0, singleplayer: 0, launcher: 0, servers: [] },
        0,
      ]
    : playtime;
  const emptyText = hidden ? "Hidden" : undefined;
  const color = locatorColor(profile.uuid);
  // Searched players keep every cape they were seen wearing. Saved after the
  // response; a cape seen for the first time is added to the list here.
  if (textures?.cape) {
    const hash = capeHash(textures.cape);
    after(() =>
      rememberCape(profile.uuid, textures.cape!).catch(console.error),
    );
    if (!capes.some((c) => c.hash === hash)) capes.push({ hash, alias: null });
  }

  return (
    <main className="min-w-0 flex-1 px-4 pt-6 pb-10 md:px-10 md:pt-[30px]">
      {/* As wide as the content, so streak and likes sit above the right edge
          of the activity box. On phones and tablets (below lg) everything is
          stacked in one column. */}
      <div className="max-w-full lg:w-fit">
        <div
          className={`flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6 ${rise}`}
        >
          {/* At least as wide as the skin column, so the links start above the activity box. */}
          <div className="min-w-0 lg:min-w-80">
            <h1 className="flex items-start gap-1 text-4xl font-extrabold tracking-tight break-all text-heading sm:text-5xl">
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
          {/* Moved down so the gap to the activity box matches the one between
              activity and stats (16px). Links on the left, streak and likes on
              the right. */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:translate-y-2">
            <PlayerLinks links={links} />
            <div className="flex shrink-0 items-center gap-2 lg:ml-auto">
              <ProfileViews uuid={profile.uuid} views={views} />
              <Streak days={streak} />
              <LikeButton uuid={profile.uuid} {...liking} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          {/* Capes clicked or hovered in the list show on the 3D skin. */}
          <CapePreviewProvider>
            {/* Below lg its boxes join the column: skin, activity and
                stats, then capes and badges. */}
            <div className="contents lg:block lg:w-80 lg:shrink-0">
              <div
                className={`relative flex w-full flex-col lg:w-80 items-center overflow-hidden rounded-[12px] border border-search-border bg-search ${rise} [animation-delay:100ms]`}
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
                className={`order-3 lg:mt-4 ${rise} [animation-delay:150ms]`}
              />
              <Badges
                badges={badges}
                className={`order-4 lg:mt-4 ${rise} [animation-delay:150ms]`}
              />
            </div>
          </CapePreviewProvider>

          {/* As tall as the skin box (480px canvas plus its border). */}
          <div className="order-2 flex min-w-0 flex-col gap-4 lg:h-[482px] lg:w-fit">
            <Heatmap
              data={days}
              accent={color}
              emptyText={emptyText}
              className={`max-w-full min-w-0 ${rise} [animation-delay:150ms]`}
            />
            <Breakdown
              accent={color}
              data={breakdown}
              emptyText={emptyText}
              className={`min-h-0 flex-1 ${rise} [animation-delay:200ms]`}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
