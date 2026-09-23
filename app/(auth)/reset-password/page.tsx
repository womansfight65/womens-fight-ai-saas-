import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { LoadingState } from '@/components/ui/states';

export const metadata: Metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password" description="Choose something you have not used before.">
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
