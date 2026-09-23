'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordResetAction } from '@/lib/auth/actions';
import { initialFormState } from '@/lib/auth/form-state';
import { FormMessage } from './form-message';

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialFormState);

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@business.com"
        error={state.fieldErrors?.email}
        required
      />
      <Button type="submit" size="lg" fullWidth loading={pending}>
        Send reset link
      </Button>
    </form>
  );
}
