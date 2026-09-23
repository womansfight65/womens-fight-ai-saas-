import { NextResponse, type NextRequest } from 'next/server';

import { integrations } from '@/lib/config/env';
import { updateSupabaseSession } from '@/lib/supabase/middleware';
import { DEV_SESSION_COOKIE, looksLikeDevSession } from '@/lib/auth/dev-session';

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/admin'];
const AUTH_PAGES = ['/login', '/signup'];

/**
 * First line of route protection. The real authorization check still happens on
 * the server in every page (see lib/auth/guards.ts) — middleware only keeps
 * signed-out visitors from loading a shell they cannot use.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });
  let userId: string | null = null;

  if (integrations.supabase) {
    const result = await updateSupabaseSession(request);
    response = result.response;
    userId = result.userId;
  } else {
    userId = looksLikeDevSession(request.cookies.get(DEV_SESSION_COOKIE)?.value) ? 'dev' : null;
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (userId && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files.
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
