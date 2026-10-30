CREATE TABLE "ticklog"."team_members" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticklog"."team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "ticklog"."users"("id") ON DELETE cascade ON UPDATE no action;