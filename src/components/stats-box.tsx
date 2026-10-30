"use client";

import { useEffect, useRef, useState } from "react";
import type { StatGroup, StatKey, StatValues } from "@/lib/stats";
import { CountUp } from "./count-up";
import { Icon } from "./icon";
import { ServerIcon } from "./server-icon";

type Filter =
  | { type: "all" }
  | { type: "singleplayer" }
  | { type: "multiplayer" }
  | { type: "server"; server: string };

const FILTER_LABELS = {
  all: "All",
  singleplayer: "Singleplayer",
  multiplayer: "Servers",
} as const;

// Sum of the groups the filter covers.
function total(groups: StatGroup[], filter: Filter, key: StatKey) {
  return groups
    .filter((g) =>
      filter.type === "all"
        ? true
        : filter.type === "singleplayer"
          ? g.kind === "singleplayer"
          : filter.type === "multiplayer"
            ? g.kind === "server"
            : g.kind === "server" && g.server === filter.server,
    )
    .reduce((n, g) => n + g.values[key], 0);
}

// 12,345 up to a million, then 1.2M.
function format(n: number) {
  if (n < 1_000_000) return n.toLocaleString("en-US");
  return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
}

// Small two-way switch inside a tile (Walk / Fly, Mobs / Players).
function Toggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <span className="flex h-5 shrink-0 items-center gap-0.5 rounded-[6px] border border-search-border bg-search p-0.5">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`flex h-full cursor-pointer items-center rounded-[4px] px-1 text-[11px] leading-none font-medium transition-colors ${
            value === key
              ? "bg-search-border text-heading"
              : "text-search-text hover:text-heading"
          }`}
        >
          {label}
        </button>
      ))}
    </span>
  );
}

// One stat, like the playtime tiles; a compact row in narrow boxes. A tile
// with a toggle shows it next to its name.
function Tile({
  label,
  icon,
  value,
  emptyText,
  toggle,
}: {
  label: React.ReactNode;
  icon: React.ReactNode;
  value: number | null;
  emptyText: string;
  toggle?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-[10px] border border-search-border bg-background px-3 py-2.5 @md:block @md:p-3">
      <div className="flex min-w-0 items-center gap-2 @md:h-5 @md:gap-1.5">
        <span className="truncate text-[12px] font-semibold tracking-wider text-search-text uppercase @md:flex-1">
          {label}
        </span>
        {toggle}
        <Icon className="size-4 shrink-0 text-search-text @max-md:order-first">
          {icon}
        </Icon>
      </div>
      <p
        className={`text-[16px] font-semibold tabular-nums @md:mt-1 @md:text-[18px] ${value === null ? "text-search-border" : "text-heading"}`}
      >
        {value === null ? emptyText : <CountUp value={value} format={format} />}
      </p>
    </div>
  );
}

// Filter at the top right: all, singleplayer, multiplayer, or one server
// (searchable).
function FilterMenu({
  servers,
  filter,
  onChange,
}: {
  servers: string[];
  filter: Filter;
  onChange: (f: Filter) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pick = (f: Filter) => {
    onChange(f);
    setOpen(false);
    setQuery("");
  };
  const matches = servers.filter((s) => s.includes(query.trim().toLowerCase()));
  const item =
    "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[7px] px-2 text-left text-[13px] transition-colors hover:bg-hover";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-7 max-w-48 cursor-pointer items-center gap-1.5 rounded-[8px] border border-search-border bg-background px-2 text-[12px] text-heading transition-colors hover:border-search-text"
      >
        {filter.type === "server" && (
          <ServerIcon server={filter.server} size={14} />
        )}
        <span className="truncate">
          {filter.type === "server"
            ? filter.server
            : FILTER_LABELS[filter.type]}
        </span>
        <Icon className="size-3.5 text-search-text">
          <path d="m6 9 6 6 6-6" />
        </Icon>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-40 mt-1.5 w-60 animate-[rise_150ms_ease-out_backwards] rounded-[10px] border border-search-border bg-background p-1 shadow-lg">
          {(["all", "singleplayer", "multiplayer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => pick({ type: t })}
              className={`${item} ${filter.type === t ? "text-heading" : "text-search-text"}`}
            >
              {FILTER_LABELS[t]}
            </button>
          ))}
          {servers.length > 0 && (
            <>
              <div className="my-1 h-px bg-search-border" />
              <label className="flex h-8 items-center gap-2 px-2 text-search-text">
                <Icon className="size-3.5">
                  <path d="m21 21-4.34-4.34" />
                  <circle cx="11" cy="11" r="8" />
                </Icon>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Server"
                  spellCheck={false}
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-heading outline-none placeholder:text-search-text max-md:text-base"
                />
              </label>
              <div className="max-h-48 overflow-y-auto">
                {matches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => pick({ type: "server", server: s })}
                    className={`${item} font-mono ${filter.type === "server" && filter.server === s ? "text-heading" : "text-search-text"}`}
                  >
                    <ServerIcon server={s} size={16} />
                    <span className="truncate">{s}</span>
                  </button>
                ))}
                {matches.length === 0 && (
                  <p className="px-2 py-1.5 text-[13px] text-search-border">
                    No servers found
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Stats counted by the mod (1.1.0 and newer), filterable by where they
// happened. `emptyText` replaces every value ("Hidden" on private profiles).
export function StatsBox({
  groups,
  servers,
  emptyText,
  className = "",
}: {
  groups: StatGroup[];
  servers: string[];
  emptyText?: string;
  className?: string;
}) {
  const [filter, setFilter] = useState<Filter>({ type: "all" });
  const [travel, setTravel] = useState<"walked" | "flown">("walked");
  const [kills, setKills] = useState<"mobKills" | "playerKills">("mobKills");
  const hasData = groups.some((g) =>
    Object.values(g.values as StatValues).some((v) => v > 0),
  );
  const empty = emptyText ?? "No data yet";
  const value = (key: StatKey) =>
    emptyText || !hasData ? null : total(groups, filter, key);

  return (
    <div
      className={`@container rounded-[12px] border border-search-border bg-search p-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold tracking-wider text-search-text uppercase">
          Stats
        </p>
        {!emptyText && (hasData || servers.length > 0) && (
          <FilterMenu servers={servers} filter={filter} onChange={setFilter} />
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 @md:grid-cols-3 @md:gap-3">
        <Tile
          // Wide tiles need the room for the toggle.
          label={
            <>
              <span className="@md:hidden">Blocks </span>Traveled
            </>
          }
          value={value(travel)}
          emptyText={empty}
          toggle={
            <Toggle
              options={[
                ["walked", "Walk"],
                ["flown", "Fly"],
              ]}
              value={travel}
              onChange={setTravel}
            />
          }
          // Lucide "footprints"
          icon={
            <>
              <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
              <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
              <path d="M16 17h4" />
              <path d="M4 13h4" />
            </>
          }
        />
        <Tile
          label="Blocks Broken"
          value={value("broken")}
          emptyText={empty}
          // Lucide "pickaxe"
          icon={
            <>
              <path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381" />
              <path d="m16 16 6-6" />
              <path d="m21.5 10.5-8-8" />
              <path d="m8 8 6-6" />
              <path d="m8.5 7.5 8 8" />
            </>
          }
        />
        <Tile
          label="Blocks Placed"
          value={value("placed")}
          emptyText={empty}
          // Lucide "box"
          icon={
            <>
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </>
          }
        />
        <Tile
          label="Kills"
          value={value(kills)}
          emptyText={empty}
          toggle={
            <Toggle
              options={[
                ["mobKills", "Mobs"],
                ["playerKills", "Players"],
              ]}
              value={kills}
              onChange={setKills}
            />
          }
          // Lucide "swords"
          icon={
            <>
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
              <line x1="13" x2="19" y1="19" y2="13" />
              <line x1="16" x2="20" y1="16" y2="20" />
              <line x1="19" x2="21" y1="21" y2="19" />
              <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
              <line x1="5" x2="9" y1="14" y2="18" />
              <line x1="7" x2="4" y1="17" y2="20" />
              <line x1="3" x2="5" y1="19" y2="21" />
            </>
          }
        />
        <Tile
          label="Deaths"
          value={value("deaths")}
          emptyText={empty}
          // Lucide "heart-crack"
          icon={
            <>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="m12 13-1-1 2-2-3-3 2-2" />
            </>
          }
        />
        <Tile
          label="Jumps"
          value={value("jumps")}
          emptyText={empty}
          // Lucide "chevrons-up"
          icon={
            <>
              <path d="m17 11-5-5-5 5" />
              <path d="m17 18-5-5-5 5" />
            </>
          }
        />
      </div>
    </div>
  );
}
