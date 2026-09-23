import { UnconfiguredSocialProvider } from '../provider';
import type { PlatformId } from '@/types';

/**
 * TikTok integration.
 *
 * Phase 2 work: OAuth handshake, token storage and refresh, media upload,
 * publish call, and reading back the post id. Until those exist this provider
 * reports "coming soon" and refuses to publish — it never reports success it
 * did not get from the TikTok API.
 */
export class TikTokProvider extends UnconfiguredSocialProvider {
  readonly platform: PlatformId = 'tiktok';
  readonly displayName = 'TikTok';
}
