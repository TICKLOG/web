-- Schema "ticklog" is created by the Supabase admin (see supabase-setup).
CREATE TABLE "ticklog"."minecraft_accounts" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticklog"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"selected_account" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticklog"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticklog"."minecraft_accounts" ADD CONSTRAINT "minecraft_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "ticklog"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticklog"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "ticklog"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticklog"."sessions" ADD CONSTRAINT "sessions_selected_account_minecraft_accounts_uuid_fk" FOREIGN KEY ("selected_account") REFERENCES "ticklog"."minecraft_accounts"("uuid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "minecraft_accounts_user_id_index" ON "ticklog"."minecraft_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "ticklog"."sessions" USING btree ("user_id");