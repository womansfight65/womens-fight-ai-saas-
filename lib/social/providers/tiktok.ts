import 'server-only';

import { createHash, randomBytes } from 'crypto';

import { env, integrations } from '@/lib/config/env';
import { getAdminStore } from '@/lib/data';
import type { PlatformId, SocialAccount, SocialConnectionStatus } from '@/types';
import type { OAuthCallbackResult, OAuthStartResult, PublishInput, PublishResult, SocialProvider } from '../provider';
import { signOAuthState, verifyOAuthState } from '../oauth-state';

const AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize/';
const API_BASE = 'https://open.tiktokapis.com/v2';
/**
 * `video.publish` (Direct Post — publishes straight to the creator's
 * profile) requires a separate TikTok audit beyond what an app gets by
 * default, even in Sandbox. `video.upload` does not: it hands the video to
 * the creator's TikTok inbox as a draft, and nothing posts until they
 * finish it themselves inside the TikTok app — use that scope instead.
 */
const SCOPES = ['user.info.basic', 'user.info.stats', 'video.upload'];

interface TikTokErrorBody {
  error?: { code?: string; message?: string };
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  open_id?: string;
  error?: string;
  error_description?: string;
}

function base64url(input: Buffer): string {
  return input.toString('base64url');
}

/** PKCE is mandatory for TikTok's OAuth — a plain client secret exchange is refused. */
function makePkcePair(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(48));
  const challenge = base64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

/**
 * TikTok publishing via the Content Posting API.
 *
 * TikTok has no equivalent of a long-lived Page token: the access token
 * expires in a few hours and must be refreshed with the stored refresh
 * token before every publish call. TikTok also only accepts video (no
 * text-only or plain-image posts), and an unaudited app can only post to
 * accounts that are added as testers in the TikTok Developer console.
 */
export class TikTokProvider implements SocialProvider {
  readonly platform: PlatformId = 'tiktok';
  readonly displayName = 'TikTok';

  get isConfigured(): boolean {
    return integrations.tiktok;
  }

  status(): SocialConnectionStatus {
    return this.isConfigured ? 'not_connected' : 'coming_soon';
  }

  async startOAuth({ workspaceId, redirectUri }: { workspaceId: string; redirectUri: string }): Promise<OAuthStartResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'TikTok publishing is not connected in this build yet.' };
    }
    const { verifier, challenge } = makePkcePair();
    const state = signOAuthState({ workspaceId, codeVerifier: verifier }, env.tiktokClientSecret);
    const params = new URLSearchParams({
      client_key: env.tiktokClientKey,
      response_type: 'code',
      scope: SCOPES.join(','),
      redirect_uri: redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    return { ok: true, url: `${AUTH_BASE}?${params.toString()}` };
  }

  async handleOAuthCallback({ code, state, redirectUri }: { code: string; state: string; redirectUri: string }): Promise<OAuthCallbackResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'TikTok is not connected in this build yet.' };
    }

    const decoded = verifyOAuthState<'codeVerifier'>(state, env.tiktokClientSecret);
    if (!decoded?.codeVerifier) {
      return { ok: false, error: 'This login link expired. Please connect again.' };
    }

    try {
      const tokenRes = await fetch(`${API_BASE}/oauth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({
          client_key: env.tiktokClientKey,
          client_secret: env.tiktokClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: decoded.codeVerifier,
        }),
      });
      const tokenJson = (await tokenRes.json()) as TokenResponse;
      if (!tokenRes.ok || !tokenJson.access_token || !tokenJson.open_id) {
        return { ok: false, error: tokenJson.error_description ?? 'TikTok rejected the login.' };
      }

      const infoRes = await fetch(`${API_BASE}/user/info/?fields=display_name,avatar_url,follower_count`, {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      });
      const infoJson = (await infoRes.json()) as {
        data?: { user?: { display_name?: string; avatar_url?: string; follower_count?: number } };
      };
      const user = infoJson.data?.user;

      return {
        ok: true,
        workspaceId: decoded.workspaceId,
        account: {
          external_account_id: tokenJson.open_id,
          display_name: user?.display_name ?? null,
          status: 'connected',
          connected_at: new Date().toISOString(),
          access_token: tokenJson.access_token,
          refresh_token: tokenJson.refresh_token ?? null,
          token_expires_at: tokenJson.expires_in
            ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString()
            : null,
          avatar_url: user?.avatar_url ?? null,
          follower_count: user?.follower_count ?? null,
        },
      };
    } catch {
      return { ok: false, error: 'Could not reach TikTok. Please try again.' };
    }
  }

  /** Refreshes and persists a new access token when the stored one is expired or close to it. */
  private async freshAccessToken(account: SocialAccount): Promise<string | null> {
    const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0;
    if (account.access_token && expiresAt - Date.now() > 60_000) {
      return account.access_token;
    }
    if (!account.refresh_token) return null;

    const res = await fetch(`${API_BASE}/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        client_key: env.tiktokClientKey,
        client_secret: env.tiktokClientSecret,
        grant_type: 'refresh_token',
        refresh_token: account.refresh_token,
      }),
    });
    const json = (await res.json()) as TokenResponse;
    if (!res.ok || !json.access_token) return null;

    const store = await getAdminStore();
    await store.upsertSocialAccount(account.workspace_id, 'tiktok', {
      access_token: json.access_token,
      refresh_token: json.refresh_token ?? account.refresh_token,
      token_expires_at: json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : null,
    });
    return json.access_token;
  }

  async publish({ item, accountId, mediaUrls }: PublishInput): Promise<PublishResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'TikTok publishing is not connected in this build yet.', retryable: false };
    }
    if (!mediaUrls?.[0]) {
      return { ok: false, error: 'TikTok requires a video — this post has none.', retryable: false };
    }

    const store = await getAdminStore();
    const accounts = await store.listSocialAccounts(item.workspace_id);
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      return { ok: false, error: 'This TikTok account is not connected.', retryable: false };
    }

    const accessToken = await this.freshAccessToken(account);
    if (!accessToken) {
      return { ok: false, error: 'TikTok login expired. Please reconnect the account.', retryable: false };
    }

    try {
      /*
       * `video.publish` (Direct Post — straight to the creator's profile,
       * with a caption we control) needs a separate TikTok audit this app
       * does not have. With only `video.upload`, the video can only be
       * handed to the creator's TikTok inbox as a draft — no post_info,
       * no privacy_level, no caption from us — and the creator finishes
       * and posts it themselves inside the TikTok app.
       */
      const initRes = await fetch(`${API_BASE}/post/publish/inbox/video/init/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          source_info: { source: 'PULL_FROM_URL', video_url: mediaUrls[0] },
        }),
      });
      const initJson = (await initRes.json()) as TikTokErrorBody & { data?: { publish_id?: string } };
      if (!initRes.ok || !initJson.data?.publish_id) {
        const retryable = initRes.status >= 500 || initRes.status === 429;
        return { ok: false, error: initJson.error?.message ?? 'TikTok rejected the video.', retryable };
      }

      return { ok: true, externalPostId: initJson.data.publish_id };
    } catch {
      return { ok: false, error: 'Could not reach TikTok. Will retry.', retryable: true };
    }
  }

  async disconnect(account: SocialAccount): Promise<{ ok: boolean; error?: string }> {
    if (account.access_token) {
      try {
        await fetch(`${API_BASE}/oauth/revoke/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_key: env.tiktokClientKey,
            client_secret: env.tiktokClientSecret,
            token: account.access_token,
          }),
        });
      } catch {
        // Best-effort: the local record is cleared by the caller regardless.
      }
    }
    return { ok: true };
  }
}
