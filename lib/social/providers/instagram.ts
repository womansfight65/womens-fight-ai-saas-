import 'server-only';

import { env, integrations } from '@/lib/config/env';
import { getAdminStore } from '@/lib/data';
import type { PlatformId, SocialAccount, SocialConnectionStatus } from '@/types';
import type { OAuthCallbackResult, OAuthStartResult, PublishInput, PublishResult, SocialProvider } from '../provider';
import { signOAuthState, verifyOAuthState } from '../oauth-state';

const AUTHORIZE_URL = 'https://api.instagram.com/oauth/authorize';
const TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const GRAPH_BASE = 'https://graph.instagram.com';

const SCOPES = ['instagram_business_basic', 'instagram_business_content_publish'];

interface GraphErrorBody {
  error_message?: string;
  error?: { message?: string };
}

interface ProfileResponse {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
}

/**
 * Instagram publishing via "Instagram API with Instagram Login" — a
 * dedicated Instagram app (its own App ID/Secret from the Meta Dashboard),
 * not the Facebook app. The creator logs in with their own Instagram
 * account directly; no Facebook Page has to be linked. All calls go to
 * graph.instagram.com, which is a separate host from the Facebook Graph API.
 */
export class InstagramProvider implements SocialProvider {
  readonly platform: PlatformId = 'instagram';
  readonly displayName = 'Instagram';

  get isConfigured(): boolean {
    return integrations.instagram;
  }

  status(): SocialConnectionStatus {
    return this.isConfigured ? 'not_connected' : 'coming_soon';
  }

  async startOAuth({ workspaceId, redirectUri }: { workspaceId: string; redirectUri: string }): Promise<OAuthStartResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'Instagram publishing is not connected in this build yet.' };
    }
    const state = signOAuthState({ workspaceId }, env.instagramAppSecret);
    const params = new URLSearchParams({
      client_id: env.instagramAppId,
      redirect_uri: redirectUri,
      state,
      response_type: 'code',
      scope: SCOPES.join(','),
    });
    return { ok: true, url: `${AUTHORIZE_URL}?${params.toString()}` };
  }

  async handleOAuthCallback({ code, state, redirectUri }: { code: string; state: string; redirectUri: string }): Promise<OAuthCallbackResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'Instagram is not connected in this build yet.' };
    }

    const decoded = verifyOAuthState(state, env.instagramAppSecret);
    if (!decoded) {
      return { ok: false, error: 'This login link expired. Please connect again.' };
    }

    try {
      const tokenBody = new URLSearchParams({
        client_id: env.instagramAppId,
        client_secret: env.instagramAppSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      });
      const tokenRes = await fetch(TOKEN_URL, { method: 'POST', body: tokenBody });
      const tokenJson = (await tokenRes.json()) as GraphErrorBody & { access_token?: string; user_id?: string };
      if (!tokenRes.ok || !tokenJson.access_token) {
        return { ok: false, error: tokenJson.error_message ?? tokenJson.error?.message ?? 'Instagram rejected the login.' };
      }

      const exchangeUrl = new URL(`${GRAPH_BASE}/access_token`);
      exchangeUrl.searchParams.set('grant_type', 'ig_exchange_token');
      exchangeUrl.searchParams.set('client_secret', env.instagramAppSecret);
      exchangeUrl.searchParams.set('access_token', tokenJson.access_token);
      const longRes = await fetch(exchangeUrl.toString());
      const longJson = (await longRes.json()) as GraphErrorBody & { access_token?: string };
      const accessToken = longRes.ok && longJson.access_token ? longJson.access_token : tokenJson.access_token;

      const profileUrl = new URL(`${GRAPH_BASE}/me`);
      profileUrl.searchParams.set('fields', 'id,username,name,profile_picture_url,followers_count');
      profileUrl.searchParams.set('access_token', accessToken);
      const profileRes = await fetch(profileUrl.toString());
      const profileJson = (await profileRes.json()) as GraphErrorBody & ProfileResponse;
      if (!profileRes.ok || !profileJson.id) {
        return { ok: false, error: profileJson.error?.message ?? 'Could not read your Instagram profile.' };
      }

      return {
        ok: true,
        workspaceId: decoded.workspaceId,
        account: {
          external_account_id: profileJson.id,
          display_name: profileJson.username ?? profileJson.name ?? 'Instagram account',
          status: 'connected',
          connected_at: new Date().toISOString(),
          access_token: accessToken,
          avatar_url: profileJson.profile_picture_url ?? null,
          follower_count: profileJson.followers_count ?? null,
        },
      };
    } catch {
      return { ok: false, error: 'Could not reach Instagram. Please try again.' };
    }
  }

  async publish({ item, accountId, mediaUrls }: PublishInput): Promise<PublishResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'Instagram publishing is not connected in this build yet.', retryable: false };
    }
    if (!mediaUrls?.[0]) {
      return { ok: false, error: 'Instagram requires an image or video — this post has neither.', retryable: false };
    }

    const store = await getAdminStore();
    const accounts = await store.listSocialAccounts(item.workspace_id);
    const account = accounts.find((a) => a.id === accountId);
    if (!account || !account.access_token || !account.external_account_id) {
      return { ok: false, error: 'This Instagram account is not connected.', retryable: false };
    }

    const caption = [item.hook, item.caption, item.cta, item.hashtags.map((h) => `#${h}`).join(' ')]
      .filter(Boolean)
      .join('\n\n');

    try {
      const containerBody = new URLSearchParams({
        image_url: mediaUrls[0],
        caption,
        access_token: account.access_token,
      });
      const containerRes = await fetch(`${GRAPH_BASE}/${account.external_account_id}/media`, {
        method: 'POST',
        body: containerBody,
      });
      const containerJson = (await containerRes.json()) as GraphErrorBody & { id?: string };
      if (!containerRes.ok || !containerJson.id) {
        const retryable = containerRes.status >= 500 || containerRes.status === 429;
        return { ok: false, error: containerJson.error?.message ?? 'Instagram rejected the media.', retryable };
      }

      const publishBody = new URLSearchParams({
        creation_id: containerJson.id,
        access_token: account.access_token,
      });
      const publishRes = await fetch(`${GRAPH_BASE}/${account.external_account_id}/media_publish`, {
        method: 'POST',
        body: publishBody,
      });
      const publishJson = (await publishRes.json()) as GraphErrorBody & { id?: string };
      if (!publishRes.ok || !publishJson.id) {
        const retryable = publishRes.status >= 500 || publishRes.status === 429;
        return { ok: false, error: publishJson.error?.message ?? 'Instagram rejected the post.', retryable };
      }

      return { ok: true, externalPostId: publishJson.id };
    } catch {
      return { ok: false, error: 'Could not reach Instagram. Will retry.', retryable: true };
    }
  }

  async disconnect(_account: SocialAccount): Promise<{ ok: boolean; error?: string }> {
    return { ok: true };
  }
}
