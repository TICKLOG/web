ALTER TABLE "ticklog"."users" DROP CONSTRAINT "users_selected_account_minecraft_accounts_uuid_fk";
--> statement-breakpoint
ALTER TABLE "ticklog"."users" DROP COLUMN "selected_account";