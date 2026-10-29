CREATE TABLE "ticklog"."mod_challenges" (
	"server_id" text PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticklog"."mod_sessions" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"last_beat_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mod_sessions_tokenHash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "ticklog"."playtime" (
	"uuid" uuid NOT NULL,
	"day" date NOT NULL,
	"kind" text NOT NULL,
	"server" text DEFAULT '' NOT NULL,
	"seconds" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "playtime_uuid_day_kind_server_pk" PRIMARY KEY("uuid","day","kind","server")
);
