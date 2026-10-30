import Link from "next/link";
import { formatDuration } from "@/lib/format";
import type { LeaderboardRow } from "./leaderboard";
import type { SkinTextures } from "@/lib/mojang";
import { PlayerSkin } from "./player-skin";

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
    // Like the skin box on profiles: the skin turns while dragged, the name
    // opens the profile.
    <div
      className={`relative flex flex-col items-center rounded-[12px] border border-search-border bg-search p-4 ${className}`}
    >
      <p className={label}>Top Player Today</p>
      <div className="my-auto flex flex-col items-center">
        <PlayerSkin textures={textures} width={240} height={320} />
        <Link
          href={`/@${player.name.toLowerCase()}`}
          className="mt-1 text-[16px] font-semibold text-heading underline-offset-4 hover:underline"
        >
          {player.name}
        </Link>
        <p className="mt-0.5 text-[14px] text-search-text tabular-nums">
          {formatDuration(player.value)} today
        </p>
      </div>
    </div>
  );
}
