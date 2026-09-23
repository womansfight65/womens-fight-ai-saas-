import type { Metadata } from 'next';

import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = { title: 'Create account' };

export default function SignupPage() {
  return (
    <AuthShell
      title="Start free"
      description="One conversation about your business, then a month of content."
      footer={
        <>
          Already have an account? <AuthLink href="/login">Log in</AuthLink>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
