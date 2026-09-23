import 'server-only';

import { getStore } from '@/lib/data';
import { PLATFORM_LIST, PLATFORMS } from '@/lib/config/platforms';
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

export interface PlatformConnectionView {
  platform: PlatformId;
  name: string;
  style: string;
  accent: string;
  status: SocialConnectionStatus;
  account: SocialAccount | null;
  isConfigured: boolean;
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
        account,
      };
    });
  }

  async connectedPlatforms(workspaceId: UUID): Promise<PlatformId[]> {
    const connections = await this.listConnections(workspaceId);
    return connections.filter((c) => c.status === 'connected').map((c) => c.platform);
  }

  async startConnection(workspaceId: UUID, platform: PlatformId, redirectUri: string) {
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
    if (account) await REGISTRY[platform].disconnect(account.id);
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
