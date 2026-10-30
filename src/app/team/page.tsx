import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { TeamPanel } from "@/components/team-panel";
import { currentTeamUser, loadTeam } from "@/lib/team";

// Team panel: only for team members, who can add and remove members here.
export default async function TeamPage() {
  const me = await currentTeamUser();
  if (!me)
    return (
      <ComingSoon title="Page Not Found" subtitle="This page doesn't exist." />
    );
  const members = await loadTeam();
  return (
    <main className="min-w-0 flex-1 px-4 pt-6 pb-10 md:px-10 md:pt-[30px]">
      <div className="max-w-2xl">
        <PageHeader
          title="Team"
          description="Manage who's on the TickLog team."
        />
        <TeamPanel members={members} me={me} />
      </div>
    </main>
  );
}
