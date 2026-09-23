import { UnconfiguredSocialProvider } from '../provider';
import type { PlatformId } from '@/types';

/**
 * Facebook integration.
 *
 * Phase 2 work: OAuth handshake, token storage and refresh, media upload,
 * publish call, and reading back the post id. Until those exist this provider
 * reports "coming soon" and refuses to publish — it never reports success it
 * did not get from the Facebook API.
 */
export class FacebookProvider extends UnconfiguredSocialProvider {
  readonly platform: PlatformId = 'facebook';
  readonly displayName = 'Facebook';
}
