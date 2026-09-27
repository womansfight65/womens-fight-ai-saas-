import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Signs the `state` parameter carried through a platform's OAuth redirect.
 * The callback has no session cookie to trust (Facebook, not our app, sends
 * the browser there), so the workspace id must travel signed and cannot be
 * accepted unless the signature and expiry both check out.
 */

const MAX_AGE_MS = 10 * 60 * 1000;

/**
 * The payload can carry extra fields a provider needs across the redirect —
 * e.g. TikTok's PKCE code_verifier, which must survive the round trip to
 * Meta/TikTok and back since nothing else here holds server-side session
 * state between the two legs of the OAuth dance.
 */
interface StatePayload {
  [key: string]: string | number;
  workspaceId: string;
  ts: number;
}

export function signOAuthState(payload: Record<string, string> & { workspaceId: string }, secret: string): string {
  const json = JSON.stringify({ ...payload, ts: Date.now() } satisfies StatePayload);
  const encoded = Buffer.from(json, 'utf8').toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyOAuthState<T extends string = never>(
  token: string,
  secret: string,
): (Record<T, string> & { workspaceId: string }) | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const body = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as StatePayload;
    if (!body.workspaceId || typeof body.ts !== 'number') return null;
    if (Date.now() - body.ts > MAX_AGE_MS) return null;
    return body as Record<T, string> & { workspaceId: string };
  } catch {
    return null;
  }
}
