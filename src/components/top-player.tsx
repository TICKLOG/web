import Link from "next/link";
import { formatDuration } from "@/lib/format";
import { locatorColor } from "@/lib/minecraft";
import type { LeaderboardRow } from "./leaderboard";
import type { SkinTextures } from "@/lib/mojang";
import { FitSkin } from "./fit-skin";

const label =
  "self-start text-[12px] font-semibold tracking-wider text-search-text uppercase";

// Today's most played player with their 3D skin and a link to their profile.
export function TopPlayer({
  player,
  textures,
  className = "",
}: {
  player: LeaderboardRow | null;
  textures: SkinTextures | null;
  className?: string;
}) {
  if (!player)
    return (
      <div
        className={`flex flex-col rounded-[12px] border border-search-border bg-search p-4 ${className}`}
      >
        <p className={label}>Top Player Today</p>
        <p className="flex flex-1 items-center justify-center py-10 text-[14px] text-search-border">
          No one played yet today
        </p>
      </div>
    );
  const color = locatorColor(player.uuid);
  return (
    // Like the skin box on profiles: the skin turns while dragged, and the
    // player's locator color glows behind it and frames the name.
    <div
      className={`relative flex flex-col overflow-hidden rounded-[12px] border border-search-border bg-search p-4 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 55%, ${color}2e, transparent 70%)`,
        }}
      />
      <div className="relative flex items-center justify-between">
        <p className={label}>Top Player Today</p>
        <span className="font-minecraft text-lg leading-none text-yellow-400">
          #1
        </span>
      </div>
      <FitSkin
        textures={textures}
        className="h-72 lg:h-auto lg:min-h-28 lg:flex-1"
      />
      <div className="relative flex items-center gap-3" style={{ color }}>
        <span className="h-px flex-1 bg-current opacity-60" />
        <Link
          href={`/@${player.name.toLowerCase()}`}
          className="max-w-[70%] truncate text-[16px] font-semibold text-heading underline-offset-4 hover:underline"
        >
          {player.name}
        </Link>
        <span className="h-px flex-1 bg-current opacity-60" />
      </div>
      <p className="relative mt-1 text-center text-[13px] text-search-text tabular-nums">
        {formatDuration(player.value)} today
      </p>
    </div>
  );
}
