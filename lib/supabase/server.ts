import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { env, integrations } from '@/lib/config/env';

/**
 * Request-scoped Supabase client. Returns null when Supabase is not configured,
 * so callers can fall back to the development store instead of crashing.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!integrations.supabase) return null;
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component: the middleware refreshes the session.
        }
      },
    },
  });
}
