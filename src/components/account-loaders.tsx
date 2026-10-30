import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { minecraftAccounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { currentTeamUser } from "@/lib/team";
import { AccountsNav } from "./accounts-nav";
import { DiscordAccount } from "./discord-account";

// Both read the login cookies, so they render at request time, inside the
// root layout's Suspense boundary.

export async function AccountsNavLoader() {
  const user = (await getCurrentUser())?.user;
  if (!user) return null;

  const [accounts, team] = await Promise.all([
    db
      .select({ uuid: minecraftAccounts.uuid, name: minecraftAccounts.name })
      .from(minecraftAccounts)
      .where(eq(minecraftAccounts.userId, user.id))
      .orderBy(
        asc(minecraftAccounts.position),
        asc(minecraftAccounts.linkedAt),
      ),
    currentTeamUser(),
  ]);
  return <AccountsNav accounts={accounts} team={Boolean(team)} />;
}

export async function DiscordAccountLoader() {
  const current = await getCurrentUser();
  return <DiscordAccount profile={current?.user ? current.discord : null} />;
}
