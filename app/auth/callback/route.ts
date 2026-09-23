import { NextResponse, type NextRequest } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Where Supabase redirects back to after an OAuth provider (Google) confirms the sign-in. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/dashboard'}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
