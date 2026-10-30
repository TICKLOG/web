CREATE TABLE "ticklog"."stats" (
	"uuid" uuid NOT NULL,
	"day" date NOT NULL,
	"kind" text NOT NULL,
	"server" text DEFAULT '' NOT NULL,
	"walked" integer DEFAULT 0 NOT NULL,
	"flown" integer DEFAULT 0 NOT NULL,
	"broken" integer DEFAULT 0 NOT NULL,
	"placed" integer DEFAULT 0 NOT NULL,
	"deaths" integer DEFAULT 0 NOT NULL,
	"jumps" integer DEFAULT 0 NOT NULL,
	"mob_kills" integer DEFAULT 0 NOT NULL,
	"player_kills" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "stats_uuid_day_kind_server_pk" PRIMARY KEY("uuid","day","kind","server")
);
