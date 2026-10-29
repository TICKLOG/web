import { and, eq, sql } from "drizzle-orm";
import Image from "next/image";
import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { minecraftAccounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";

// Page of one of the user's linked Minecraft accounts at /accounts/{name}
// (lowercase): its name as the title, settings below later.
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
  return (
    <main className="flex-1 px-10 pt-[30px] pb-10">
      <div className="max-w-2xl">
        <PageHeader
          title={account.name}
          description="Customize this account."
          icon={
            // Same head as in the sidebar.
            <Image
              src={`/heads/${account.uuid}.png`}
              alt=""
              width={28}
              height={28}
              unoptimized
              className="size-7 shrink-0 rounded-[5px] [image-rendering:pixelated]"
            />
          }
        />
      </div>
    </main>
  );
}
