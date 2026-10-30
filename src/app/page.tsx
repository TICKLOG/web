import { CountUp } from "@/components/count-up";
import { Icon } from "@/components/icon";
import { OnlineChart } from "@/components/online-chart";
import { PageHeader } from "@/components/page-header";
import { loadOnline } from "@/lib/online";
import { loadSiteStats } from "@/lib/site-stats";

// The page builds up block by block, like the settings page.
const rise =
  "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

function StatTile({
  label,
  value,
  icon,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    // Phones: one row per tile, icon and label left, number right.
    <div
      className={`flex items-center justify-between rounded-[12px] border border-search-border bg-search px-4 py-3 sm:block sm:p-4 ${rise}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 sm:justify-between">
        <span className="text-[12px] font-semibold tracking-wider text-search-text uppercase">
          {label}
        </span>
        <Icon className="size-4 shrink-0 text-search-text max-sm:order-first">
          {icon}
        </Icon>
      </div>
      <p className="text-xl font-semibold text-heading tabular-nums sm:mt-1 sm:text-2xl">
        <CountUp value={value} />
      </p>
    </div>
  );
}

export default async function Home() {
  const [stats, online] = await Promise.all([loadSiteStats(), loadOnline()]);
  return (
    <main className="min-w-0 flex-1 px-4 pt-6 pb-10 md:px-10 md:pt-[30px]">
      <div className="max-w-5xl">
        <PageHeader
          title="TICKLOG"
          description="Track your Minecraft playtime with a single mod."
        />

        {/* Site totals, then players online with the mod. */}
        <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          <StatTile
            label="Tracked Players"
            value={stats.players}
            delay={70}
            // Lucide "users"
            icon={
              <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </>
            }
          />
          <StatTile
            label="Tracked Hours"
            value={stats.hours}
            delay={105}
            // Lucide "clock"
            icon={
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </>
            }
          />
          <StatTile
            label="Tracked Servers"
            value={stats.servers}
            delay={140}
            // Lucide "server", like the Servers tile on player pages
            icon={
              <>
                <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                <line x1="6" x2="6.01" y1="6" y2="6" />
                <line x1="6" x2="6.01" y1="18" y2="18" />
              </>
            }
          />
          <StatTile
            label="Registered Players"
            value={stats.registered}
            delay={175}
            // Lucide "user-check"
            icon={
              <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </>
            }
          />
        </div>
        <OnlineChart
          data={online}
          className={`mt-3 ${rise} [animation-delay:210ms]`}
        />
      </div>
    </main>
  );
}
