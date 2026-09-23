import { NextResponse } from 'next/server';

import { PLATFORMS } from '@/lib/config/platforms';
import { getSocialProvider } from '@/lib/social/social-service';
import type { PlatformId } from '@/types';

/**
 * OAuth callback endpoint.
 *
 * The route exists so each provider has a stable redirect URI to register with
 * its platform. Until a provider is genuinely configured it refuses the
 * callback rather than writing a connection that does not exist.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;

  if (!(platform in PLATFORMS)) {
    return NextResponse.json({ error: 'Unknown platform.' }, { status: 404 });
  }

  const provider = getSocialProvider(platform as PlatformId);
  if (!provider.isConfigured) {
    return NextResponse.json(
      {
        error: `${provider.displayName} is not connected in this build.`,
        platform,
        status: provider.status(),
      },
      { status: 501 },
    );
  }

  // Token exchange and account persistence go here once credentials exist.
  return NextResponse.json({ error: 'Not implemented.' }, { status: 501 });
}
