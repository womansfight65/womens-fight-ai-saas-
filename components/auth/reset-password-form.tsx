'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPasswordAction } from '@/lib/auth/actions';
import { initialFormState } from '@/lib/auth/form-state';
import { AuthLink } from './auth-shell';
import { FormMessage } from './form-message';

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initialFormState);
  const token = useSearchParams().get('token') ?? '';

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />

      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={state.fieldErrors?.password}
        required
      />
      <Input
        label="Confirm new password"
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat it"
        error={state.fieldErrors?.confirm_password}
        required
      />

      <Button type="submit" size="lg" fullWidth loading={pending}>
        Update password
      </Button>

      {state.status === 'success' ? (
        <p className="text-sm text-ink-muted">
          <AuthLink href="/login">Back to log in</AuthLink>
        </p>
      ) : null}
    </form>
  );
}
