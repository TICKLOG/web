"use server";

import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { minecraftAccounts, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseClient } from "@/lib/supabase/server";

// Removes a Minecraft account from the user; it can be linked again later.
export async function unlinkAccount(uuid: string) {
  const user = (await getCurrentUser())?.user;
  if (!user) return;

  await db
    .delete(minecraftAccounts)
    .where(and(eq(minecraftAccounts.uuid, uuid), eq(minecraftAccounts.userId, user.id)));
  refresh();
}

// Saves the sidebar order of the user's accounts (uuids in display order).
export async function reorderAccounts(uuids: string[]) {
  const user = (await getCurrentUser())?.user;
  if (!user) return;

  if (uuids.length === 0) return;
  // One statement, so concurrent reorders can't deadlock on each other's rows.
  const order = sql.join(
    uuids.map((uuid, position) => sql`(${uuid}::uuid, ${position}::int)`),
    sql`, `,
  );
  await db.execute(sql`
    update ${minecraftAccounts}
    set position = v.position
    from (values ${order}) as v(uuid, position)
    where ${minecraftAccounts.uuid} = v.uuid and ${minecraftAccounts.userId} = ${user.id}
  `);
  refresh();
}

// Ends the Discord login. Linked accounts stay for the next sign-in.
export async function logout() {
  const supabase = await createSupabaseClient();
  await supabase.auth.signOut();
  refresh();
}

// Deletes the TickLog user (linked accounts and their data cascade) and the
// Discord login in Supabase Auth.
export async function deleteAccount() {
  const current = await getCurrentUser();
  if (!current) return;

  if (current.user) await db.delete(users).where(eq(users.id, current.user.id));
  const supabase = await createSupabaseClient();
  await supabase.auth.signOut();
  const { error } = await createSupabaseAdminClient().auth.admin.deleteUser(current.authId);
  if (error) console.error("Deleting the Supabase Auth user failed:", error);
  redirect("/");
}
