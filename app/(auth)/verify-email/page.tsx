import type { Metadata } from 'next';
import { MailCheck } from 'lucide-react';

import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { integrations } from '@/lib/config/env';

export const metadata: Metadata = { title: 'Verify your email' };

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Check your inbox"
      description={
        integrations.supabase
          ? 'We sent you a confirmation link. Open it to activate your account.'
          : 'Email verification is handled by Supabase Auth, which is not configured in this build.'
      }
      footer={
        <>
          Already confirmed? <AuthLink href="/login">Log in</AuthLink>
        </>
      }
    >
      <div className="flex items-start gap-4 rounded-3xl border border-line bg-surface-soft p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-purple shadow-soft">
          <MailCheck className="h-5 w-5" aria-hidden />
        </span>
        <div className="text-sm leading-relaxed text-ink-muted">
          <p>
            The link expires after an hour. If it does not arrive, check your spam folder or request a new
            one from the log-in screen.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
