import 'server-only';

import { env, integrations } from '@/lib/config/env';
import { getAdminStore } from '@/lib/data';
import type { PlatformId, SocialAccount, SocialConnectionStatus } from '@/types';
import type { OAuthCallbackResult, OAuthStartResult, PublishInput, PublishResult, SocialProvider } from '../provider';
import { signOAuthState } from '../oauth-state';

const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_content_publish',
  'business_management',
];

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string; username?: string };
}

interface GraphErrorBody {
  error?: { message?: string };
}

/**
 * Instagram publishing via the Graph API.
 *
 * Instagram has no login of its own here — a Business/Creator Instagram
 * account must already be linked to a Facebook Page, and this reuses the
 * same Facebook app and OAuth dialog (with Instagram scopes added) to reach
 * it. The Page access token from that login is what calls the Instagram
 * Graph API too. Instagram never accepts a text-only post, so publish()
 * refuses without at least one media URL.
 */
export class InstagramProvider implements SocialProvider {
  readonly platform: PlatformId = 'instagram';
  readonly displayName = 'Instagram';

  get isConfigured(): boolean {
    return integrations.facebook;
  }

  status(): SocialConnectionStatus {
    return this.isConfigured ? 'not_connected' : 'coming_soon';
  }

  async startOAuth({ workspaceId, redirectUri }: { workspaceId: string; redirectUri: string }): Promise<OAuthStartResult> {
    if (!this.isConfigured) {
      return { ok: false, error: 'Instagram publishing is not connected in this build yet.' };
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
      return { ok: false, error: 'Instagram is not connected in this build yet.' };
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
      pagesUrl.searchParams.set('fields', 'id,name,access_token,instagram_business_account{id,username}');
      const pagesRes = await fetch(pagesUrl.toString());
      const pagesJson = (await pagesRes.json()) as GraphErrorBody & { data?: FacebookPage[] };
      if (!pagesRes.ok || !Array.isArray(pagesJson.data)) {
        return { ok: false, error: pagesJson.error?.message ?? 'Could not read your Facebook Pages.' };
      }

      const pageWithInstagram = pagesJson.data.find((p) => p.instagram_business_account?.id);
      if (!pageWithInstagram || !pageWithInstagram.instagram_business_account) {
        return {
          ok: false,
          error:
            'No Instagram Business or Creator account is linked to any of your Facebook Pages. Link one in the Instagram app first (Settings -> Account type -> switch to Professional, then connect it to your Page), then try again.',
        };
      }

      return {
        ok: true,
        account: {
          external_account_id: pageWithInstagram.instagram_business_account.id,
          display_name: pageWithInstagram.instagram_business_account.username ?? pageWithInstagram.name,
          status: 'connected',
          connected_at: new Date().toISOString(),
          access_token: pageWithInstagram.access_token,
        },
      };
    } catch {
      return { ok: false, error: 'Could not reach Facebook. Please try again.' };
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
