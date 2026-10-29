import { formatDuration } from "@/lib/format";
import { cellStyle, LEVELS } from "@/lib/heat";
import { type HeatCell, HeatmapGrid } from "./heatmap-grid";
import { ScrollEnd } from "./scroll-end";

const WEEKS = 52;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function level(seconds: number) {
  const h = seconds / 3600;
  if (seconds === 0) return 0;
  if (h < 1) return 1;
  if (h < 2.5) return 2;
  if (h < 4) return 3;
  return 4;
}

// Playtime per day over the last year, in the player's locator color.
// `data` maps "YYYY-MM-DD" to seconds.
export function Heatmap({
  data,
  accent,
  className = "",
}: {
  data: Map<string, number>;
  accent: string;
  className?: string;
}) {
  // Days are UTC, like the playtime the mod sends.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dow = (today.getUTCDay() + 6) % 7; // Monday = 0
  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - dow - (WEEKS - 1) * 7);

  const weeks: { date: Date; seconds: number }[][] = [];
  let total = 0;
  for (let w = 0; w < WEEKS; w++) {
    const col: { date: Date; seconds: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + w * 7 + d);
      const key = date.toISOString().slice(0, 10);
      const seconds = data.get(key) ?? 0;
      total += seconds;
      col.push({ date, seconds });
    }
    weeks.push(col);
  }

  const cells: HeatCell[] = weeks.flat().map(({ date, seconds }) => ({
    key: date.toISOString(),
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    seconds,
    level: level(seconds),
    future: date > today,
  }));

  // Month name above the first week of each month.
  const labels = weeks.map((col, i) => {
    const m = col[0].date.getUTCMonth();
    const prev = i > 0 ? weeks[i - 1][0].date.getUTCMonth() : -1;
    return m !== prev && i !== 0 ? MONTHS[m] : "";
  });

  return (
    <div className={`rounded-[12px] border border-search-border bg-search p-4 ${className}`}>
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-semibold tracking-wider text-search-text uppercase">Activity</p>
        <p className="text-[12px] text-search-text">
          {total > 0 ? (
            <>
              <span className="font-semibold text-heading">{formatDuration(total)}</span> in the last year
            </>
          ) : (
            "No data yet"
          )}
        </p>
      </div>
      <ScrollEnd className="mt-4 flex gap-2 pb-1">
        <div className="grid grid-rows-7 gap-[3px] pt-5 text-[10px] leading-[11px] text-search-text">
          {DAYS.map((d, i) => (
            <span key={d} className="h-[11px]">
              {i % 2 === 0 ? d : ""}
            </span>
          ))}
        </div>
        <div>
          <div className="grid h-5 auto-cols-[11px] grid-flow-col gap-[3px] text-[10px] text-search-text">
            {labels.map((l, i) => (
              <span key={weeks[i][0].date.toISOString()} className="relative">
                <span className="absolute left-0 whitespace-nowrap">{l}</span>
              </span>
            ))}
          </div>
          <HeatmapGrid cells={cells} accent={accent} />
        </div>
      </ScrollEnd>
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-search-text">
        Less
        {LEVELS.map((o, i) => (
          <span key={o} className="relative size-[11px] rounded-[2px] bg-search-border">
            {i > 0 && <span className="absolute inset-0 rounded-[2px]" style={cellStyle(accent, i)} />}
          </span>
        ))}
        More
      </div>
    </div>
  );
}
