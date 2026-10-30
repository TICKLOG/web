import { Leaderboard } from "@/components/leaderboard";
import { loadLeaderboard } from "@/lib/leaderboard";

// Most played players today, this month and all time.
export default async function LeaderboardPage() {
  const data = await loadLeaderboard();
  return (
    <main className="min-w-0 flex-1 px-4 pt-6 pb-10 md:px-10 md:pt-[30px]">
      <div className="max-w-3xl">
        <Leaderboard data={data} />
      </div>
    </main>
  );
}
