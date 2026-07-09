import { createClient } from "@supabase/supabase-js";

// Service-role client for trusted server-only writes (e.g. the inbound-email
// webhook). NEVER import this into a client component — it bypasses RLS.
// Requires SUPABASE_SERVICE_ROLE_KEY in the environment (Vercel project env).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
