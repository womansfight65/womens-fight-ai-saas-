/**
 * Development session cookie helpers.
 *
 * Kept free of `next/headers` and `server-only` so middleware (which runs in
 * the Edge runtime) can read the cookie without pulling in Node-only modules.
 * The HMAC is verified in Node, inside `lib/auth/session.ts`; middleware only
 * checks the cookie's shape, because it is a redirect convenience and never the
 * authorization decision.
 */

export const DEV_SESSION_COOKIE = 'wf_dev_session';

/** Cheap structural check used by middleware. Not an authorization check. */
export function looksLikeDevSession(raw: string | undefined): boolean {
  if (!raw) return false;
  const separator = raw.lastIndexOf('.');
  if (separator <= 0) return false;
  const signature = raw.slice(separator + 1);
  return /^[a-f0-9]{64}$/i.test(signature);
}
