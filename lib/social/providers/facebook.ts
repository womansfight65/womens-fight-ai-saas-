import 'server-only';

import { env, integrations } from '@/lib/config/env';
import { getAdminStore } from '@/lib/data';
import type { PlatformId, SocialAccount, SocialConnectionStatus } from '@/types';
import type { OAuthCallbackResult, OAuthStartResult, PublishInput, PublishResult, SocialProvider } from '../provider';
import { signOAuthState } from '../oauth-state';

const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

const SCOPES = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'business_management'];

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface GraphErrorBody {
  error?: { message?: string };
}

/**
 * Real Facebook Page publishing via the Graph API.
 *
 * Flow: our OAuth dialog link -> Facebook login -> callback with a `code` ->
 * exchange for a short-lived user token -> exchange that for a long-lived
 * user token -> read /me/accounts for the Pages the user administers, each
 * with its own Page access token (Page tokens minted from a long-lived user
 * token do not expire). The first Page returned is the one connected; a page
 * picker can replace that once an account needs more than one.
 */
export class FacebookProvider implements SocialProvider {
  readonly platform: PlatformId = 'facebook';
  readonly displayName = 'Facebook';

  get isConfigured(): boolean {
    return integrations.facebook;
  }

  status(): SocialConnectionStatus {
    return this.isConfigured ? 'not_connected' : 'coming_soon';
  }

  async startOAuth({ workspaceId, redirectUri }: { workspaceId: string; redirectUri: string }): Promise<OAuthStartResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'Facebook publishing is not connected in this build yet.' };
    }
    const state = signOAuthState({ workspaceId }, env.facebookAppSecret);
    const params = new URLSearchParams({
      client_id: env.facebookAppId,
      redirect_uri: redirectUri,
      state,
      response_type: 'code',
      scope: SCOPES.join(','),
    });
    return { ok: true, url: `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}` };
  }

  async handleOAuthCallback({ code, redirectUri }: { workspaceId: string; code: string; redirectUri: string }): Promise<OAuthCallbackResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'Facebook is not connected in this build yet.' };
    }

    try {
      const shortTokenUrl = new URL(`${GRAPH_BASE}/oauth/access_token`);
      shortTokenUrl.searchParams.set('client_id', env.facebookAppId);
      shortTokenUrl.searchParams.set('client_secret', env.facebookAppSecret);
      shortTokenUrl.searchParams.set('redirect_uri', redirectUri);
      shortTokenUrl.searchParams.set('code', code);
      const shortRes = await fetch(shortTokenUrl.toString());
      const shortJson = (await shortRes.json()) as GraphErrorBody & { access_token?: string };
      if (!shortRes.ok || !shortJson.access_token) {
        return { ok: false, error: shortJson.error?.message ?? 'Facebook rejected the login.' };
      }

      const longTokenUrl = new URL(`${GRAPH_BASE}/oauth/access_token`);
      longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
      longTokenUrl.searchParams.set('client_id', env.facebookAppId);
      longTokenUrl.searchParams.set('client_secret', env.facebookAppSecret);
      longTokenUrl.searchParams.set('fb_exchange_token', shortJson.access_token);
      const longRes = await fetch(longTokenUrl.toString());
      const longJson = (await longRes.json()) as GraphErrorBody & { access_token?: string };
      const userToken = longRes.ok && longJson.access_token ? longJson.access_token : shortJson.access_token;

      const pagesUrl = new URL(`${GRAPH_BASE}/me/accounts`);
      pagesUrl.searchParams.set('access_token', userToken);
      pagesUrl.searchParams.set('fields', 'id,name,access_token');
      const pagesRes = await fetch(pagesUrl.toString());
      const pagesJson = (await pagesRes.json()) as GraphErrorBody & { data?: FacebookPage[] };
      if (!pagesRes.ok || !Array.isArray(pagesJson.data)) {
        return { ok: false, error: pagesJson.error?.message ?? 'Could not read your Facebook Pages.' };
      }
      if (pagesJson.data.length === 0) {
        return {
          ok: false,
          error: 'No Facebook Page found on this account. You must be an admin of a Page to connect it.',
        };
      }

      const page = pagesJson.data[0];
      return {
        ok: true,
        account: {
          external_account_id: page.id,
          display_name: page.name,
          status: 'connected',
          connected_at: new Date().toISOString(),
          access_token: page.access_token,
        },
      };
    } catch {
      return { ok: false, error: 'Could not reach Facebook. Please try again.' };
    }
  }

  async publish({ item, accountId, mediaUrls }: PublishInput): Promise<PublishResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'Facebook publishing is not connected in this build yet.', retryable: false };
    }

    const store = await getAdminStore();
    const accounts = await store.listSocialAccounts(item.workspace_id);
    const account = accounts.find((a) => a.id === accountId);
    if (!account || !account.access_token || !account.external_account_id) {
      return { ok: false, error: 'This Facebook Page is not connected.', retryable: false };
    }

    const message = [item.hook, item.caption, item.cta, item.hashtags.map((h) => `#${h}`).join(' ')]
      .filter(Boolean)
      .join('\n\n');

    try {
      const endpoint = mediaUrls?.[0]
        ? `${GRAPH_BASE}/${account.external_account_id}/photos`
        : `${GRAPH_BASE}/${account.external_account_id}/feed`;
      const body = new URLSearchParams({ access_token: account.access_token });
      if (mediaUrls?.[0]) {
        body.set('url', mediaUrls[0]);
        body.set('caption', message);
      } else {
        body.set('message', message);
      }

      const res = await fetch(endpoint, { method: 'POST', body });
      const json = (await res.json()) as GraphErrorBody & { id?: string; post_id?: string };

      if (!res.ok || !json.id) {
        const retryable = res.status >= 500 || res.status === 429;
        return { ok: false, error: json.error?.message ?? 'Facebook rejected the post.', retryable };
      }

      const postId = json.post_id ?? json.id;
      return { ok: true, externalPostId: postId, url: `https://www.facebook.com/${postId}` };
    } catch {
      return { ok: false, error: 'Could not reach Facebook. Will retry.', retryable: true };
    }
  }

  async disconnect(_account: SocialAccount): Promise<{ ok: boolean; error?: string }> {
    // Best-effort local disconnect only — we hold a Page token, not the user
    // token needed to reliably revoke the app grant. The user can also remove
    // "WF Autopost AI" from Facebook: Settings & privacy -> Business Integrations.
    return { ok: true };
  }
}
