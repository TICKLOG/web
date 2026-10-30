import { formatDuration } from "@/lib/format";
import type { TopServer } from "@/lib/site-stats";
import { ServerIcon } from "./server-icon";

const SLOTS = 5;

// Today's most played servers on the home page, like the top servers on
// player pages. Empty slots keep the list's shape.
export function TopServers({
  servers,
  className = "",
}: {
  servers: TopServer[];
  className?: string;
}) {
  const max = servers[0]?.seconds || 1;
  return (
    <div
      className={`@container rounded-[12px] border border-search-border bg-search p-4 ${className}`}
    >
      <p className="text-[12px] font-semibold tracking-wider text-search-text uppercase">
        Top Servers Today
      </p>
      <ol className="mt-3 flex flex-col gap-2">
        {Array.from({ length: SLOTS }, (_, i) => {
          const s = servers[i];
          return (
            <li
              key={s?.server ?? i}
              className="flex items-center gap-3 text-[14px]"
            >
              <span className="w-4 font-mono text-[12px] text-search-text">
                {i + 1}
              </span>
              <span
                className={`flex min-w-0 flex-1 items-center gap-2 font-mono @md:w-56 @md:flex-none ${s ? "text-heading" : "text-search-border"}`}
              >
                <ServerIcon server={s?.server ?? null} size={20} dim={!s} />
                <span className="truncate">{s ? s.server : "No data yet"}</span>
              </span>
              {/* No room for the bar in a narrow box. */}
              <span className="relative h-1.5 flex-1 rounded-full bg-search-border @max-md:hidden">
                {s && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 dark:bg-emerald-400"
                    style={{ width: `${(s.seconds / max) * 100}%` }}
                  />
                )}
              </span>
              <span
                className={`shrink-0 text-right tabular-nums @max-md:hidden @md:w-24 ${s ? "text-search-text" : "text-search-border"}`}
              >
                {s
                  ? `${s.players} ${s.players === 1 ? "player" : "players"}`
                  : "—"}
              </span>
              <span
                className={`shrink-0 text-right tabular-nums @md:w-20 ${s ? "text-search-text" : "text-search-border"}`}
              >
                {s ? formatDuration(s.seconds) : "—"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
