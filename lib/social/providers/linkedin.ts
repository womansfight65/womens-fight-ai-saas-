import { UnconfiguredSocialProvider } from '../provider';
import type { PlatformId } from '@/types';

/**
 * LinkedIn integration.
 *
 * Phase 2 work: OAuth handshake, token storage and refresh, media upload,
 * publish call, and reading back the post id. Until those exist this provider
 * reports "coming soon" and refuses to publish — it never reports success it
 * did not get from the LinkedIn API.
 */
export class LinkedInProvider extends UnconfiguredSocialProvider {
  readonly platform: PlatformId = 'linkedin';
  readonly displayName = 'LinkedIn';
}
