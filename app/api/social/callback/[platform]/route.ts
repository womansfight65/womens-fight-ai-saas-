import { NextResponse } from 'next/server';

import { env } from '@/lib/config/env';
import { PLATFORMS } from '@/lib/config/platforms';
import { getStore } from '@/lib/data';
import { getSocialProvider } from '@/lib/social/social-service';
import type { PlatformId } from '@/types';

/**
 * OAuth callback endpoint.
 *
 * The route exists so each provider has a stable redirect URI to register with
 * its platform. Until a provider is genuinely configured it refuses the
 * callback rather than writing a connection that does not exist. The browser
 * lands here straight from the platform's own site, so there is no session
 * cookie to trust — each provider verifies the signed `state` param itself
 * (see lib/social/oauth-state.ts) and hands back the workspace id it decoded.
 */
export async function GET(request: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const socialUrl = new URL('/dashboard/social', env.siteUrl);

  if (!(platform in PLATFORMS)) {
    return NextResponse.json({ error: 'Unknown platform.' }, { status: 404 });
  }

  const provider = getSocialProvider(platform as PlatformId);
  const requestUrl = new URL(request.url);
  const oauthError = requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error');
  if (oauthError) {
    socialUrl.searchParams.set('social_error', oauthError);
    return NextResponse.redirect(socialUrl);
  }

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

  if (!provider.handleOAuthCallback) {
    return NextResponse.json({ error: 'Not implemented.' }, { status: 501 });
  }

  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  if (!code || !state) {
    socialUrl.searchParams.set('social_error', `The ${provider.displayName} login did not complete. Please try again.`);
    return NextResponse.redirect(socialUrl);
  }

  const redirectUri = `${env.siteUrl}/api/social/callback/${platform}`;
  const result = await provider.handleOAuthCallback({ code, state, redirectUri });

  if (!result.ok) {
    socialUrl.searchParams.set('social_error', result.error);
    return NextResponse.redirect(socialUrl);
  }

  const store = await getStore();
  await store.upsertSocialAccount(result.workspaceId, platform as PlatformId, result.account);

  socialUrl.searchParams.set('connected', platform);
  return NextResponse.redirect(socialUrl);
}
