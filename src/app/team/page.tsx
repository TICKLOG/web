import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { TeamPanel } from "@/components/team-panel";
import { SettingsSection } from "@/components/settings-section";
import { currentTeamUser, loadTeam } from "@/lib/team";
import { listTestBuilds } from "@/lib/test-builds";

// Team panel: only for team members, who can add and remove members here.
export default async function TeamPage() {
  const me = await currentTeamUser();
  if (!me)
    return (
      <ComingSoon title="Page Not Found" subtitle="This page doesn't exist." />
    );
  const [members, builds] = await Promise.all([loadTeam(), listTestBuilds()]);
  return (
    <main className="min-w-0 flex-1 px-4 pt-6 pb-10 md:px-10 md:pt-[30px]">
      <div className="max-w-2xl">
        <PageHeader
          title="Team"
          description="Manage who's on the TickLog team."
        />
        <TeamPanel members={members} me={me} />
        {builds.length > 0 && (
          <SettingsSection
            title="Test Build"
            description="Mod builds to try before they're released. Pick your Minecraft version."
            delay={105}
          >
            <ul className="divide-y divide-search-border rounded-[14px] border border-search-border">
              {builds.map((file) => (
                <li
                  key={file}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]"
                >
                  <span className="truncate font-mono text-heading">
                    {file}
                  </span>
                  {/* A plain link: the route sends the file. */}
                  <a
                    href={`/team/test-build/${encodeURIComponent(file)}`}
                    download
                    className="flex h-8 shrink-0 items-center rounded-[8px] bg-heading px-3 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </SettingsSection>
        )}
      </div>
    </main>
  );
}
