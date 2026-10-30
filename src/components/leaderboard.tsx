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
// Stats the leaderboard ranks by; only playtime for now.
const STAT = {
  label: "Playtime",
  icon: CLOCK,
  color: "text-emerald-400",
  format: formatDuration,
};

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

// Page title with the time range select, above the ranked list.
export function Leaderboard({ data }: { data: LeaderboardData }) {
  const [rangeId, setRange] = useState("all");
  const stat = STAT;
  const key = `playtime:${rangeId}`;
  const rows = data[key] ?? [];
  const top = rows[0]?.value || 1;

  return (
    <div>
      <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-4 ${rise}`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Leaderboard</h1>
          <p className="mt-1 text-[15px] text-search-text">The most played TickLog players.</p>
        </div>
        <Segmented options={RANGES} value={rangeId} onChange={setRange} />
      </div>

      <div className={`mt-6 overflow-hidden rounded-[12px] border border-search-border bg-search ${rise} [animation-delay:60ms]`}>
        <ScrollArea className="max-h-[calc(100dvh-196px)] max-md:max-h-[calc(100dvh-260px)]" resetKey={key}>
          {rows.length === 0 && (
            <p className="flex h-40 items-center justify-center text-[14px] text-search-border">
              No playtime yet
            </p>
          )}
          {/* Re-keyed on every switch so the rows build up again. */}
          <ol key={key} className="divide-y divide-search-border">
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
