import { formatDuration } from "@/lib/format";
import { Icon } from "./icon";
import { ServerIcon } from "./server-icon";

export type BreakdownData = {
  server: number;
  singleplayer: number;
  launcher: number;
  // Top servers by playtime, most first.
  servers: { server: string; seconds: number }[];
};

const NO_DATA = "No data yet";

function Tile({
  icon,
  label,
  seconds,
}: {
  icon: React.ReactNode;
  label: string;
  seconds: number;
}) {
  const empty = seconds < 60;
  return (
    <div className="rounded-[10px] border border-search-border bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold tracking-wider text-search-text uppercase">
          {label}
        </span>
        <Icon className="size-4 text-search-text">{icon}</Icon>
      </div>
      <p
        className={`mt-1 text-[18px] font-semibold tabular-nums ${empty ? "text-search-border" : "text-heading"}`}
      >
        {empty ? NO_DATA : formatDuration(seconds)}
      </p>
    </div>
  );
}

// Where the player plays (servers, singleplayer, just the launcher) and their
// top three servers, like on the old site.
export function Breakdown({
  data,
  accent,
  className = "",
}: {
  data: BreakdownData;
  accent: string;
  className?: string;
}) {
  const max = Math.max(1, ...data.servers.map((s) => s.seconds));
  return (
    <div
      className={`rounded-[12px] border border-search-border bg-search p-4 ${className}`}
    >
      <p className="text-[12px] font-semibold tracking-wider text-search-text uppercase">
        Stats
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Tile
          label="Servers"
          seconds={data.server}
          icon={
            <>
              <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
              <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
              <line x1="6" x2="6.01" y1="6" y2="6" />
              <line x1="6" x2="6.01" y1="18" y2="18" />
            </>
          }
        />
        <Tile
          label="Singleplayer"
          seconds={data.singleplayer}
          icon={
            <>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </>
          }
        />
        <Tile
          label="Launcher"
          seconds={data.launcher}
          icon={
            <>
              <line x1="6" x2="10" y1="11" y2="11" />
              <line x1="8" x2="8" y1="9" y2="13" />
              <line x1="15" x2="15.01" y1="12" y2="12" />
              <line x1="18" x2="18.01" y1="10" y2="10" />
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
            </>
          }
        />
      </div>
      <p className="mt-4 text-[12px] font-semibold tracking-wider text-search-text uppercase">
        Top Servers
      </p>
      <ol className="mt-2 flex flex-col gap-1.5">
        {[0, 1, 2].map((i) => {
          const s = data.servers[i];
          return (
            <li
              key={s?.server ?? i}
              className="flex items-center gap-3 text-[14px]"
            >
              <span className="w-4 font-mono text-[12px] text-search-text">
                {i + 1}
              </span>
              <span
                className={`flex w-56 items-center gap-2 font-mono ${s ? "text-heading" : "text-search-border"}`}
              >
                <ServerIcon server={s?.server ?? null} size={20} dim={!s} />
                <span className="truncate">{s ? s.server : NO_DATA}</span>
              </span>
              <span className="relative h-1.5 flex-1 rounded-full bg-search-border">
                {s && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${(s.seconds / max) * 100}%`,
                      backgroundColor: accent,
                    }}
                  />
                )}
              </span>
              <span
                className={`w-20 text-right tabular-nums ${s ? "text-search-text" : "text-search-border"}`}
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
