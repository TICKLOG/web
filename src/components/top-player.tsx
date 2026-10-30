import Link from "next/link";
import { formatDuration } from "@/lib/format";
import type { LeaderboardRow } from "./leaderboard";
import type { SkinTextures } from "@/lib/mojang";
import { PlayerSkin } from "./player-skin";

const label =
  "self-start text-[12px] font-semibold tracking-wider text-search-text uppercase";

// Today's most played player with their 3D skin; opens their profile.
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
    <Link
      href={`/@${player.name.toLowerCase()}`}
      className={`flex flex-col items-center rounded-[12px] border border-search-border bg-search p-4 transition-colors hover:border-search-text ${className}`}
    >
      <p className={label}>Top Player Today</p>
      {/* Skin, name and time together in the middle; the skin is only looked
          at here, the whole box is the link. */}
      <div className="my-auto flex flex-col items-center pt-2">
        <div className="pointer-events-none">
          <PlayerSkin
            textures={textures && { ...textures, cape: null }}
            width={160}
            height={190}
          />
        </div>
        <p className="mt-2 text-[16px] font-semibold text-heading">
          {player.name}
        </p>
        <p className="mt-0.5 text-[14px] text-search-text tabular-nums">
          {formatDuration(player.value)}
        </p>
      </div>
    </Link>
  );
}
