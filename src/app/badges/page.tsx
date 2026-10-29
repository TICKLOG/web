import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Badges" };

// Placeholder until there are badges to earn.
export default function BadgesPage() {
  return <ComingSoon title="Badges" />;
}
