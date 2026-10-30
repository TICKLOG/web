"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/format";
import { locatorColor } from "@/lib/minecraft";
import { Icon } from "./icon";
import { ScrollArea } from "./scroll-area";

const rise = "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

const CLOCK = (
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);
const FOOTPRINTS = (
  <>
    <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
    <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
    <path d="M16 17h4" />
    <path d="M4 13h4" />
  </>
);

// Stats the leaderboard can rank by.
const STATS = [
  {
    id: "playtime",
    label: "Playtime",
    icon: CLOCK,
    color: "text-emerald-400",
    format: formatDuration,
  },
  {
    id: "distance",
    label: "Distance Walked",
    icon: FOOTPRINTS,
    color: "text-sky-400",
    // Not tracked yet; shown but not selectable.
    disabled: true,
    format: (km: number) => `${km.toLocaleString("en-US")} km`,
  },
];

const RANGES = [
  { id: "today", label: "Today" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

export type LeaderboardRow = { uuid: string; name: string; value: number };
// Ranked rows per "<stat>:<range>", most first.
export type LeaderboardData = Record<string, LeaderboardRow[]>;

// Gold, silver, bronze for the top 3.
const MEDALS = ["text-yellow-400", "text-zinc-400", "text-amber-600"];

// Box of buttons with a pill that slides to the selected one.
function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; icon?: React.ReactNode; disabled?: boolean }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = refs.current[value];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);

  return (
    <div className="relative flex h-10 items-center gap-1 rounded-[10px] border border-search-border bg-search p-1">
      {pill && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-[7px] bg-search-border transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={pill}
        />
      )}
      {options.map((o) => (
        <button
          key={o.id}
          ref={(el) => {
            refs.current[o.id] = el;
          }}
          type="button"
          aria-pressed={o.id === value}
          disabled={o.disabled}
          title={o.disabled ? "Coming Soon" : undefined}
          onClick={() => onChange(o.id)}
          className={`relative flex h-full items-center gap-1.5 px-3 text-[14px] font-medium whitespace-nowrap transition-colors ${
            o.disabled
              ? "cursor-default text-nav-text opacity-40"
              : o.id === value
                ? "cursor-pointer text-heading"
                : "cursor-pointer text-nav-text hover:text-heading"
          }`}
        >
          {o.icon && <Icon className="size-4">{o.icon}</Icon>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Stat and time range select above the ranked list, like the old leaderboard.
export function Leaderboard({ data }: { data: LeaderboardData }) {
  const [statId, setStat] = useState(STATS[0].id);
  const [rangeId, setRange] = useState("all");
  const stat = STATS.find((s) => s.id === statId) ?? STATS[0];
  const rows = data[`${statId}:${rangeId}`] ?? [];
  const top = rows[0]?.value || 1;

  function pick(nextStat: string, nextRange: string) {
    setStat(nextStat);
    setRange(nextRange);
  }

  return (
    <div className={`mt-8 ${rise} [animation-delay:60ms]`}>
      <div className="flex flex-wrap justify-between gap-2">
        <Segmented options={STATS} value={statId} onChange={(id) => pick(id, rangeId)} />
        <Segmented options={RANGES} value={rangeId} onChange={(id) => pick(statId, id)} />
      </div>

      <div className="mt-3 overflow-hidden rounded-[12px] border border-search-border bg-search">
        <ScrollArea className="h-[calc(100dvh-214px)] min-h-[280px]" resetKey={`${statId}:${rangeId}`}>
          {/* Re-keyed on every switch so the rows build up again. */}
          <ol key={`${statId}:${rangeId}`} className="divide-y divide-search-border">
            {rows.map((r, i) => {
              const big = i < 3;
              const delay = Math.min(i, 12) * 40;
              return (
                <li key={r.uuid} className={rise} style={{ animationDelay: `${delay}ms` }}>
                  <Link
                    href={`/@${r.name.toLowerCase()}`}
                    className={`relative flex items-center gap-4 overflow-hidden px-5 transition-colors hover:bg-hover ${big ? "py-4" : "py-3"}`}
                  >
                    <span
                      className={`w-12 shrink-0 font-minecraft leading-none ${big ? "text-2xl" : "text-lg"} ${MEDALS[i] ?? "text-search-text"}`}
                    >
                      #{i + 1}
                    </span>
                    <Image
                      src={`/heads/${r.uuid}.png`}
                      alt=""
                      width={big ? 44 : 32}
                      height={big ? 44 : 32}
                      unoptimized
                      className="max-w-none shrink-0 rounded-[3px] [image-rendering:pixelated]"
                    />
                    <span className={`min-w-0 flex-1 truncate font-semibold text-heading ${big ? "text-lg" : "text-[15px]"}`}>
                      {r.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[14px]">
                      <Icon className={`size-3.5 ${stat.color}`}>{stat.icon}</Icon>
                      <span className="font-semibold text-heading tabular-nums">{stat.format(r.value)}</span>
                    </span>
                    {/* Share of the leader's value, in the player's locator color. */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-0.5 animate-[grow_800ms_cubic-bezier(0.22,1,0.36,1)_backwards] motion-reduce:animate-none"
                      style={{
                        width: `${Math.max(1, (r.value / top) * 100)}%`,
                        background: locatorColor(r.uuid),
                        animationDelay: `${150 + delay}ms`,
                      }}
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      </div>
    </div>
  );
}
