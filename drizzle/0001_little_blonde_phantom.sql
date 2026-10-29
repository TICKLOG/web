ALTER TABLE "ticklog"."users" ADD COLUMN "auth_id" uuid;--> statement-breakpoint
ALTER TABLE "ticklog"."users" ADD COLUMN "selected_account" uuid;--> statement-breakpoint
ALTER TABLE "ticklog"."users" ADD CONSTRAINT "users_selected_account_minecraft_accounts_uuid_fk" FOREIGN KEY ("selected_account") REFERENCES "ticklog"."minecraft_accounts"("uuid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticklog"."users" ADD CONSTRAINT "users_authId_unique" UNIQUE("auth_id");