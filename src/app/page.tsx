import { CountUp } from "@/components/count-up";
import { Icon } from "@/components/icon";
import { OnlineChart } from "@/components/online-chart";
import { PageHeader } from "@/components/page-header";
import { loadOnline } from "@/lib/online";
import { TopPlayer } from "@/components/top-player";
import { TopServers } from "@/components/top-servers";
import { loadLeaderboard } from "@/lib/leaderboard";
import { fetchTextures } from "@/lib/mojang";
import { loadSiteStats, loadTopServersToday } from "@/lib/site-stats";

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

// Space for an advertiser, with a mail link to get in touch.
function AdBox({ className }: { className: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[12px] border border-dashed border-search-border bg-search px-6 py-10 text-center ${className}`}
    >
      {/* Lucide "megaphone" */}
      <Icon className="size-6 text-search-text">
        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
        <path d="M8 6v8" />
      </Icon>
      <p className="mt-4 text-[17px] font-semibold text-heading">
        Your Ad Here
      </p>
      <p className="mt-1.5 max-w-60 text-[14px] leading-6 text-search-text">
        Reach Minecraft players who track their playtime with TickLog.
      </p>
      <a
        href="mailto:info@ticklog.net?subject=Advertising%20on%20TickLog"
        className="mt-5 flex h-10 items-center rounded-[10px] bg-heading px-4 text-[14px] font-medium text-background transition-opacity hover:opacity-85"
      >
        Get in Contact
      </a>
    </div>
  );
}

export default async function Home() {
  const [stats, online, topServers, leaderboard] = await Promise.all([
    loadSiteStats(),
    loadOnline(),
    loadTopServersToday(),
    loadLeaderboard(),
  ]);
  const topPlayer = leaderboard["playtime:today"]?.[0] ?? null;
  const topTextures = topPlayer ? await fetchTextures(topPlayer.uuid) : null;
  return (
    <main className="flex min-w-0 flex-1 flex-col px-4 pt-6 pb-10 md:px-10 md:pt-[30px]">
      <div className="flex flex-1 flex-col">
        <PageHeader
          title="TICKLOG"
          description="Track your Minecraft playtime with a single mod."
        />

        {/* Site totals and players online with the mod; on wide screens the
            ad box sits on the right, down to the bottom of the page. */}
        <div className="mt-8 flex flex-1 flex-col gap-3 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
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
            <div className="mt-3 flex flex-1 flex-col gap-3 lg:flex-row">
              <TopServers
                servers={topServers}
                className={`min-w-0 lg:flex-1 lg:self-start ${rise} [animation-delay:245ms]`}
              />
              <TopPlayer
                player={topPlayer}
                textures={topTextures}
                className={`lg:w-80 lg:shrink-0 ${rise} [animation-delay:280ms]`}
              />
            </div>
          </div>
          <AdBox
            className={`xl:w-64 xl:shrink-0 ${rise} [animation-delay:315ms]`}
          />
        </div>
      </div>
    </main>
  );
}
