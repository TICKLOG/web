import Link from "next/link";
import { formatDuration } from "@/lib/format";
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
  return (
    // Name and today's time at the top; the skin fills the rest of the box
    // and turns while dragged, like on profiles.
    <div
      className={`flex flex-col rounded-[12px] border border-search-border bg-search p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className={label}>Top Player Today</p>
        <span className="font-minecraft text-lg leading-none text-yellow-400">
          #1
        </span>
      </div>
      <Link
        href={`/@${player.name.toLowerCase()}`}
        className="mt-3 truncate text-[18px] font-semibold text-heading underline-offset-4 hover:underline"
      >
        {player.name}
      </Link>
      <p className="mt-0.5 text-[13px] text-search-text tabular-nums">
        {formatDuration(player.value)} today
      </p>
      <FitSkin
        textures={textures}
        className="mt-2 h-72 lg:h-auto lg:min-h-24 lg:flex-1"
      />
    </div>
  );
}
