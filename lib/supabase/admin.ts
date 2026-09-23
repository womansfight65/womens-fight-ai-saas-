import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import { env, integrations } from '@/lib/config/env';

let cached: SupabaseClient | null = null;

/**
 * Service-role client. Server-only: bypasses RLS, so it is used exclusively by
 * the admin panel, the scheduler worker and internal jobs — never by anything
 * that renders for an ordinary user.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!integrations.supabase || !integrations.supabaseAdmin) return null;
  if (!cached) {
    cached = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
