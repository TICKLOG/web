"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { OnlineData, OnlinePoint } from "@/lib/online";
import { Segmented } from "./segmented";

type Range = "today" | "week" | "month" | "year";

const RANGES: { id: Range; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

const HEIGHT = 200;
const PAD = { top: 10, right: 6, bottom: 24, left: 30 };

// Today and Week are peaks online (local time); Month and Year are players
// per UTC day.
const PER_DAY: Record<Range, boolean> = {
  today: false,
  week: false,
  month: true,
  year: true,
};

const time = (d: Date) =>
  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const date = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function tooltipLabel(range: Range, at: string) {
  const d = new Date(at);
  if (range === "today") return time(d);
  if (range === "week")
    return `${d.toLocaleDateString("en-US", { weekday: "short" })} ${time(d)}`;
  return date(d);
}

// Indices of the points that get an x-axis label, with their text.
function ticks(range: Range, points: OnlinePoint[]) {
  const out: { i: number; label: string }[] = [];
  points.forEach((p, i) => {
    const d = new Date(p.at);
    if (range === "today" && d.getMinutes() === 0 && d.getHours() % 6 === 0)
      out.push({ i, label: time(d) });
    if (range === "week" && d.getMinutes() === 0 && d.getHours() === 0)
      out.push({
        i,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    if (range === "month" && (points.length - 1 - i) % 7 === 0)
      out.push({ i, label: date(d) });
    if (range === "year" && d.getUTCDate() === 1)
      out.push({
        i,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
      });
  });
  return out;
}

// Top of the y-axis: a round number at or above the highest value, so the
// grid lines (quarters) land on whole numbers.
function niceMax(max: number) {
  if (max <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(max / 4)));
  for (const m of [1, 2, 5, 10]) if (step * m * 4 >= max) return step * m * 4;
  return max;
}

// Players online right now, and a chart of the chosen range with a hover
// readout.
export function OnlineChart({
  data,
  className = "",
}: {
  data: OnlineData;
  className?: string;
}) {
  const [range, setRange] = useState<Range>("today");
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const points = data[range];
  const top = niceMax(Math.max(...points.map((p) => p.value)));
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : 0);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const line = points
    .map(
      (p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`,
    )
    .join("");
  const area = `${line}L${x(points.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const point = hover === null ? null : points[hover];
  const unit = PER_DAY[range] ? "players" : "online";

  function onPointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(
      ((e.clientX - rect.left - PAD.left) / plotW) * (points.length - 1),
    );
    setHover(Math.min(points.length - 1, Math.max(0, i)));
  }

  return (
    <div
      className={`rounded-[12px] border border-search-border bg-search p-4 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold tracking-wider text-search-text uppercase">
            Online Now
          </p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-heading tabular-nums">
            <span className="relative flex size-2.5">
              {data.now > 0 && (
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              )}
              <span
                className={`relative size-2.5 rounded-full ${data.now > 0 ? "bg-emerald-400" : "bg-search-border"}`}
              />
            </span>
            {data.now.toLocaleString("en-US")}
          </p>
        </div>
        <Segmented
          options={RANGES}
          value={range}
          onChange={(id) => {
            setRange(id as Range);
            setHover(null);
          }}
        />
      </div>

      <div ref={box} className="relative mt-4" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            className="block touch-pan-y select-none"
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="online-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.25" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid in quarters of the top value, labelled on the left. */}
            {[0, 1, 2, 3, 4].map((q) => {
              const v = (top / 4) * q;
              return (
                <g key={q}>
                  <line
                    x1={PAD.left}
                    x2={width - PAD.right}
                    y1={y(v)}
                    y2={y(v)}
                    className="stroke-search-border"
                    strokeDasharray={q ? "2 4" : undefined}
                  />
                  <text
                    x={PAD.left - 8}
                    y={y(v)}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-search-text text-[11px] tabular-nums"
                  >
                    {v}
                  </text>
                </g>
              );
            })}
            {ticks(range, points).map((t) => (
              <text
                key={t.i}
                x={x(t.i)}
                y={HEIGHT - 6}
                // Labels at the edges stay inside the chart.
                textAnchor={
                  x(t.i) > width - 30
                    ? "end"
                    : x(t.i) < PAD.left + 20
                      ? "start"
                      : "middle"
                }
                className="fill-search-text text-[11px]"
              >
                {t.label}
              </text>
            ))}
            <g className="text-emerald-500 dark:text-emerald-400">
              <path d={area} fill="url(#online-fill)" />
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {point && hover !== null && (
                <>
                  <line
                    x1={x(hover)}
                    x2={x(hover)}
                    y1={PAD.top}
                    y2={y(0)}
                    className="stroke-search-text"
                    strokeDasharray="2 3"
                  />
                  <circle
                    cx={x(hover)}
                    cy={y(point.value)}
                    r={4.5}
                    fill="currentColor"
                    className="stroke-search"
                    strokeWidth={2}
                  />
                </>
              )}
            </g>
          </svg>
        )}
        {point && hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-[8px] border border-search-border bg-background px-2.5 py-1.5 text-[12px] whitespace-nowrap shadow-lg"
            style={{
              left: Math.min(Math.max(x(hover), 60), width - 60),
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-search-text">
              {tooltipLabel(range, point.at)}
            </span>
            <span className="ml-2 font-semibold text-heading tabular-nums">
              {point.value} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
