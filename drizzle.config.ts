import { defineConfig } from "drizzle-kit";

process.loadEnvFile(".env.local");

// Migrations use Supabase's session pooler (port 5432) instead of the
// transaction pooler the app uses.
const url = new URL(process.env.DATABASE_URL!);
url.port = "5432";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: url.toString() },
  schemaFilter: ["ticklog"],
  // The app role may not create schemas, so keep the journal in "ticklog".
  migrations: { schema: "ticklog", table: "__drizzle_migrations" },
});
