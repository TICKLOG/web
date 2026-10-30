import Link from "next/link";
import { formatDuration } from "@/lib/format";
import type { LeaderboardRow } from "./leaderboard";
import type { SkinTextures } from "@/lib/mojang";
import { FitSkin } from "./fit-skin";
import { Icon } from "./icon";

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
      <p className={label}>Top Player Today</p>
      {/* Name tag over the head like in game, today's time under the feet. */}
      <FitSkin
        textures={textures}
        className="mt-2 h-96 lg:h-auto lg:min-h-40 lg:flex-1"
        above={
          <Link
            href={`/@${player.name.toLowerCase()}`}
            className="max-w-full truncate rounded-[3px] bg-search-border px-2 py-1 font-minecraft text-[14px] leading-none text-heading transition-opacity hover:opacity-80"
          >
            <span className="text-yellow-500 dark:text-yellow-400">#1</span> {player.name}
          </Link>
        }
        below={
          <p className="flex items-center gap-1.5 text-[14px]">
            <Icon className="size-3.5 text-emerald-400">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </Icon>
            <span className="text-search-text tabular-nums">
              {formatDuration(player.value)} Today
            </span>
          </p>
        }
      />
    </div>
  );
}
