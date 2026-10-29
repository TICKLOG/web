import { and, eq, sql } from "drizzle-orm";
import { AccountSettings } from "@/components/account-settings";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { minecraftAccounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { isProfileHidden, loadServers } from "@/lib/playtime";

// Page of one of the user's linked Minecraft accounts at /accounts/{name}
// (lowercase): its name as the title and its settings.
export default async function AccountPage({ params }: PageProps<"/accounts/[name]">) {
  const { name } = await params;
  const user = (await getCurrentUser())?.user;
  const [account] = user
    ? await db
        .select({ uuid: minecraftAccounts.uuid, name: minecraftAccounts.name })
        .from(minecraftAccounts)
        .where(and(eq(minecraftAccounts.userId, user.id), eq(sql`lower(${minecraftAccounts.name})`, name.toLowerCase())))
    : [];
  if (!account) return <ComingSoon title="Account Not Found" subtitle="This account isn't linked to you." />;
  const [hidden, servers] = await Promise.all([isProfileHidden(account.uuid), loadServers(account.uuid)]);
  return (
    <main className="flex-1 px-10 pt-[30px] pb-10">
      <div className="max-w-2xl">
        <PageHeader title={account.name} description="Customize this account." />
        <AccountSettings uuid={account.uuid} hidden={hidden} servers={servers} />
      </div>
    </main>
  );
}
