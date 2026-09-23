import 'server-only';

import { integrations } from '@/lib/config/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { DevStore } from './dev-store';
import { SupabaseStore } from './supabase-store';
import type { DataStore } from './store';

let devStore: DevStore | null = null;

function getDevStore(): DevStore {
  if (!devStore) devStore = new DevStore();
  return devStore;
}

/**
 * The store every server module uses. Supabase when configured, the local
 * development store otherwise.
 */
export async function getStore(): Promise<DataStore> {
  if (integrations.supabase) {
    const client = await createSupabaseServerClient();
    if (client) return new SupabaseStore(client);
  }
  return getDevStore();
}

/** Elevated store for admin screens and background workers only. */
export async function getAdminStore(): Promise<DataStore> {
  if (integrations.supabase && integrations.supabaseAdmin) {
    const client = getSupabaseAdminClient();
    if (client) return new SupabaseStore(client);
  }
  return getStore();
}

export type { DataStore, ContentQuery, AdminStats } from './store';
