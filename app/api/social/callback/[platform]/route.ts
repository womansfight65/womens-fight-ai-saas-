import { NextResponse } from 'next/server';

import { env } from '@/lib/config/env';
import { PLATFORMS } from '@/lib/config/platforms';
import { getStore } from '@/lib/data';
import { getSocialProvider } from '@/lib/social/social-service';
import { verifyOAuthState } from '@/lib/social/oauth-state';
import type { PlatformId } from '@/types';

/**
 * OAuth callback endpoint.
 *
 * The route exists so each provider has a stable redirect URI to register with
 * its platform. Until a provider is genuinely configured it refuses the
 * callback rather than writing a connection that does not exist. The browser
 * lands here straight from the platform's own site, so there is no session
 * cookie to trust — the workspace id travels in the signed `state` param
 * instead (see lib/social/oauth-state.ts).
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
    socialUrl.searchParams.set('social_error', 'The Facebook login did not complete. Please try again.');
    return NextResponse.redirect(socialUrl);
  }

  const decoded = verifyOAuthState(state, process.env.FACEBOOK_APP_SECRET ?? '');
  if (!decoded) {
    socialUrl.searchParams.set('social_error', 'This login link expired. Please connect again.');
    return NextResponse.redirect(socialUrl);
  }

  const redirectUri = `${env.siteUrl}/api/social/callback/${platform}`;
  const result = await provider.handleOAuthCallback({ workspaceId: decoded.workspaceId, code, redirectUri });

  if (!result.ok) {
    socialUrl.searchParams.set('social_error', result.error);
    return NextResponse.redirect(socialUrl);
  }

  const store = await getStore();
  await store.upsertSocialAccount(decoded.workspaceId, platform as PlatformId, result.account);

  socialUrl.searchParams.set('connected', platform);
  return NextResponse.redirect(socialUrl);
}
