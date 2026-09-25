import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Signs the `state` parameter carried through a platform's OAuth redirect.
 * The callback has no session cookie to trust (Facebook, not our app, sends
 * the browser there), so the workspace id must travel signed and cannot be
 * accepted unless the signature and expiry both check out.
 */

const MAX_AGE_MS = 10 * 60 * 1000;

interface StatePayload {
  workspaceId: string;
  ts: number;
}

export function signOAuthState(payload: { workspaceId: string }, secret: string): string {
  const json = JSON.stringify({ ...payload, ts: Date.now() } satisfies StatePayload);
  const encoded = Buffer.from(json, 'utf8').toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyOAuthState(token: string, secret: string): { workspaceId: string } | null {
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
    return { workspaceId: body.workspaceId };
  } catch {
    return null;
  }
}
