import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Leaderboard" };

// Placeholder until the mod sends stats; the list itself is ready in
// components/leaderboard.tsx.
export default function LeaderboardPage() {
  return <ComingSoon title="Leaderboard" />;
}
