import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { minecraftAccounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { currentTeamUser } from "@/lib/team";
import { AccountsNav } from "./accounts-nav";
import { DiscordAccount } from "./discord-account";
import { Icon } from "./icon";
import { NavItem } from "./nav-item";

// Both read the login cookies, so they render at request time, inside the
// root layout's Suspense boundary.

export async function AccountsNavLoader() {
  const user = (await getCurrentUser())?.user;
  if (!user) return null;

  const accounts = await db
    .select({ uuid: minecraftAccounts.uuid, name: minecraftAccounts.name })
    .from(minecraftAccounts)
    .where(eq(minecraftAccounts.userId, user.id))
    .orderBy(asc(minecraftAccounts.position), asc(minecraftAccounts.linkedAt));
  return <AccountsNav accounts={accounts} />;
}

// "Team" nav item, only for team members.
export async function TeamNavLoader() {
  if (!(await currentTeamUser())) return null;
  return (
    <NavItem
      label="Team"
      href="/team"
      icon={
        // Lucide "shield-user"
        <Icon>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="M6.376 18.91a6 6 0 0 1 11.249.003" />
          <circle cx="12" cy="11" r="4" />
        </Icon>
      }
    />
  );
}

export async function DiscordAccountLoader() {
  const current = await getCurrentUser();
  return <DiscordAccount profile={current?.user ? current.discord : null} />;
}
