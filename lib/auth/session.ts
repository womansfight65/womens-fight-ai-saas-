import 'server-only';

import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

import { integrations } from '@/lib/config/env';
import { getStore } from '@/lib/data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profile, SessionUser, Workspace } from '@/types';
import { DEV_SESSION_COOKIE } from './dev-session';

export { DEV_SESSION_COOKIE };

const DEV_SECRET =
  process.env.DEV_SESSION_SECRET ?? 'womans-fight-ai-development-session-secret';

function sign(value: string): string {
  return createHmac('sha256', DEV_SECRET).update(value).digest('hex');
}

export function encodeDevSession(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function decodeDevSession(raw: string | undefined): string | null {
  if (!raw) return null;
  const separator = raw.lastIndexOf('.');
  if (separator === -1) return null;
  const userId = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  const expected = sign(userId);
  if (signature.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return userId;
}

/** The signed-in user id, from Supabase Auth or the development session cookie. */
export async function getCurrentUserId(): Promise<string | null> {
  if (integrations.supabase) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  }
  const cookieStore = await cookies();
  return decodeDevSession(cookieStore.get(DEV_SESSION_COOKIE)?.value);
}

export interface SessionContext {
  user: SessionUser;
  profile: Profile;
  workspace: Workspace;
}

/**
 * Resolves the full session context: profile plus the active workspace. Returns
 * null when nobody is signed in — callers redirect rather than assume.
 */
export async function getSession(): Promise<SessionContext | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const store = await getStore();
  const profile = await store.getProfile(userId);
  if (!profile) return null;

  const workspaces = await store.listWorkspacesForUser(userId);
  let workspace = workspaces[0];
  if (!workspace) {
    workspace = await store.createWorkspace({
      owner_id: userId,
      name: profile.full_name ? `${profile.full_name}'s workspace` : 'My workspace',
    });
    await store.addWorkspaceMember({ workspace_id: workspace.id, user_id: userId, role: 'owner' });
  }

  return {
    profile,
    workspace,
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      workspace_id: workspace.id,
      onboarding_completed: profile.onboarding_completed,
    },
  };
}
