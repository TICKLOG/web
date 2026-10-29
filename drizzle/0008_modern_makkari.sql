CREATE TABLE "ticklog"."likes" (
	"uuid" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_uuid_user_id_pk" PRIMARY KEY("uuid","user_id")
);
--> statement-breakpoint
ALTER TABLE "ticklog"."likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "ticklog"."users"("id") ON DELETE cascade ON UPDATE no action;