import 'server-only';

import { getStore } from '@/lib/data';
import { PLATFORM_LIST, PLATFORMS } from '@/lib/config/platforms';
import { getPlan } from '@/lib/config/plans';
import type { PlatformId, SocialAccount, SocialConnectionStatus, UUID } from '@/types';
import type { SocialProvider } from './provider';
import { FacebookProvider } from './providers/facebook';
import { InstagramProvider } from './providers/instagram';
import { YouTubeProvider } from './providers/youtube';
import { TikTokProvider } from './providers/tiktok';
import { XProvider } from './providers/x';
import { LinkedInProvider } from './providers/linkedin';

const REGISTRY: Record<PlatformId, SocialProvider> = {
  facebook: new FacebookProvider(),
  instagram: new InstagramProvider(),
  youtube: new YouTubeProvider(),
  tiktok: new TikTokProvider(),
  x: new XProvider(),
  linkedin: new LinkedInProvider(),
};

export function getSocialProvider(platform: PlatformId): SocialProvider {
  return REGISTRY[platform];
}

/** What the client is allowed to see — access/refresh tokens never leave the server. */
export type PublicSocialAccount = Omit<SocialAccount, 'access_token' | 'refresh_token' | 'token_expires_at'>;

export interface PlatformConnectionView {
  platform: PlatformId;
  name: string;
  style: string;
  accent: string;
  status: SocialConnectionStatus;
  account: PublicSocialAccount | null;
  isConfigured: boolean;
}

function toPublicAccount(account: SocialAccount): PublicSocialAccount {
  const { access_token: _access_token, refresh_token: _refresh_token, token_expires_at: _token_expires_at, ...rest } = account;
  return rest;
}

class SocialService {
  /** What the Social Accounts page renders: real state, never an assumption. */
  async listConnections(workspaceId: UUID): Promise<PlatformConnectionView[]> {
    const store = await getStore();
    const accounts = await store.listSocialAccounts(workspaceId);
    return PLATFORM_LIST.map((meta) => {
      const provider = REGISTRY[meta.id];
      const account = accounts.find((a) => a.platform === meta.id) ?? null;
      return {
        platform: meta.id,
        name: meta.name,
        style: meta.style,
        accent: meta.accent,
        isConfigured: provider.isConfigured,
        status: account?.status ?? provider.status(),
        account: account ? toPublicAccount(account) : null,
      };
    });
  }

  async connectedPlatforms(workspaceId: UUID): Promise<PlatformId[]> {
    const connections = await this.listConnections(workspaceId);
    return connections.filter((c) => c.status === 'connected').map((c) => c.platform);
  }

  /**
   * Each plan caps how many platforms a workspace may have connected at
   * once (see `connected_platforms` in lib/config/plans.ts) — this is the
   * one place that cap is actually enforced, gating the start of a new
   * OAuth connection rather than something a page can route around.
   * Reconnecting a platform that is already connected never counts as a
   * new one.
   */
  async startConnection(workspaceId: UUID, platform: PlatformId, redirectUri: string) {
    const alreadyConnected = await this.connectedPlatforms(workspaceId);
    if (!alreadyConnected.includes(platform)) {
      const store = await getStore();
      const subscription = await store.getSubscription(workspaceId);
      const plan = getPlan(subscription?.plan_id ?? 'free');
      if (alreadyConnected.length >= plan.limits.connected_platforms) {
        return {
          ok: false as const,
          error:
            plan.limits.connected_platforms <= 1
              ? `Your ${plan.name} plan allows connecting 1 platform. Upgrade to connect more.`
              : `Your ${plan.name} plan allows up to ${plan.limits.connected_platforms} connected platforms. Upgrade to connect more.`,
        };
      }
    }

    const provider = REGISTRY[platform];
    const result = await provider.startOAuth({ workspaceId, redirectUri });
    if (!result.ok) {
      const store = await getStore();
      await store.upsertSocialAccount(workspaceId, platform, { status: provider.status() });
    }
    return result;
  }

  async disconnect(workspaceId: UUID, platform: PlatformId) {
    const store = await getStore();
    const accounts = await store.listSocialAccounts(workspaceId);
    const account = accounts.find((a) => a.platform === platform);
    if (account) await REGISTRY[platform].disconnect(account);
    return store.upsertSocialAccount(workspaceId, platform, {
      status: REGISTRY[platform].status(),
      external_account_id: null,
      display_name: null,
      connected_at: null,
    });
  }

  platformName(platform: PlatformId): string {
    return PLATFORMS[platform].name;
  }
}

export const socialService = new SocialService();
