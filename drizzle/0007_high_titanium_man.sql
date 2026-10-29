CREATE TABLE "ticklog"."servers" (
	"address" text PRIMARY KEY NOT NULL,
	"reachable" boolean NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
