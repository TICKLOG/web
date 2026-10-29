CREATE TABLE "ticklog"."capes" (
	"hash" text PRIMARY KEY NOT NULL,
	"alias" text
);
--> statement-breakpoint
CREATE TABLE "ticklog"."player_capes" (
	"uuid" uuid NOT NULL,
	"hash" text NOT NULL,
	"seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_capes_uuid_hash_pk" PRIMARY KEY("uuid","hash")
);
--> statement-breakpoint
ALTER TABLE "ticklog"."player_capes" ADD CONSTRAINT "player_capes_hash_capes_hash_fk" FOREIGN KEY ("hash") REFERENCES "ticklog"."capes"("hash") ON DELETE no action ON UPDATE no action;