import 'server-only';

import { redirect } from 'next/navigation';

import { getSession, type SessionContext } from './session';

/** Use inside any /dashboard route. Sends signed-out visitors to login. */
export async function requireSession(nextPath?: string): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    const target = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';
    redirect(target);
  }
  return session;
}

/** Use inside any /dashboard route that assumes a Business Brain exists. */
export async function requireOnboarded(nextPath?: string): Promise<SessionContext> {
  const session = await requireSession(nextPath);
  if (!session.user.onboarding_completed) redirect('/onboarding');
  return session;
}

/**
 * Use inside every /admin route. Authorization is checked on the server, on
 * each request — never in the browser.
 */
export async function requireAdmin(): Promise<SessionContext> {
  const session = await requireSession('/admin');
  if (session.user.role !== 'admin') redirect('/dashboard?denied=admin');
  return session;
}
