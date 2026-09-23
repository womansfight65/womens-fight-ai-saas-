import { Suspense } from 'react';
import type { Metadata } from 'next';

import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { LoadingState } from '@/components/ui/states';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to pick up where your content plan left off."
      footer={
        <>
          New here? <AuthLink href="/signup">Create an account</AuthLink>
        </>
      }
    >
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
