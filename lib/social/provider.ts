import type { ContentItem, PlatformId, SocialAccount, SocialConnectionStatus } from '@/types';

export interface PublishInput {
  item: ContentItem;
  accountId: string;
  /** Media URLs, once the media pipeline is connected. */
  mediaUrls?: string[];
}

export type PublishResult =
  | { ok: true; externalPostId: string; url?: string }
  | { ok: false; error: string; retryable: boolean };

export interface OAuthStartResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export type OAuthCallbackResult =
  | { ok: true; account: Partial<SocialAccount> }
  | { ok: false; error: string };

/**
 * Every platform integration implements this. Nothing else in the product
 * knows how a specific network works, so adding a real Facebook or LinkedIn
 * integration means writing one class — not touching the scheduler, the
 * calendar or the UI.
 */
export interface SocialProvider {
  readonly platform: PlatformId;
  readonly displayName: string;
  /** False until real app credentials and OAuth are wired up. */
  readonly isConfigured: boolean;
  status(): SocialConnectionStatus;
  startOAuth(params: { workspaceId: string; redirectUri: string }): Promise<OAuthStartResult>;
  /** Completes the OAuth dance for platforms that implement it — absent otherwise. */
  handleOAuthCallback?(params: {
    workspaceId: string;
    code: string;
    redirectUri: string;
  }): Promise<OAuthCallbackResult>;
  publish(input: PublishInput): Promise<PublishResult>;
  disconnect(account: SocialAccount): Promise<{ ok: boolean; error?: string }>;
}

/**
 * Base implementation used by every platform until its API is connected.
 * It refuses to publish rather than pretending to succeed.
 */
export abstract class UnconfiguredSocialProvider implements SocialProvider {
  abstract readonly platform: PlatformId;
  abstract readonly displayName: string;
  readonly isConfigured = false;

  status(): SocialConnectionStatus {
    return 'coming_soon';
  }

  async startOAuth(): Promise<OAuthStartResult> {
    return {
      ok: false,
      error: `${this.displayName} publishing is not connected in this build yet.`,
    };
  }

  async publish(): Promise<PublishResult> {
    return {
      ok: false,
      error: `${this.displayName} publishing is not connected in this build yet.`,
      retryable: false,
    };
  }

  async disconnect(): Promise<{ ok: boolean; error?: string }> {
    return { ok: true };
  }
}
