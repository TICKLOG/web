import { createClient } from "@supabase/supabase-js";

// Supabase client with the secret key, for admin actions. Server only: never
// import this from client code.
export function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
