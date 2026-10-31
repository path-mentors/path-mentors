import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client that bypasses Row Level Security.
 * Use ONLY in trusted server-side admin endpoints after an explicit
 * role check — never expose this key to the client.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service-role environment variables are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
