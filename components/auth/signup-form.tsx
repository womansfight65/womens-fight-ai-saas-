'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpAction } from '@/lib/auth/actions';
import { initialFormState } from '@/lib/auth/form-state';
import { FormMessage } from './form-message';
import { GoogleButton } from './google-button';

export function SignupForm() {
  const [state, action, pending] = useActionState(signUpAction, initialFormState);

  return (
    <div className="space-y-5">
      <GoogleButton next="/dashboard" />

      <form action={action} className="space-y-5" noValidate>
        <FormMessage state={state} />

        <Input
          label="Your name"
          name="full_name"
          autoComplete="name"
          placeholder="Ayesha Rahman"
          error={state.fieldErrors?.full_name}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@business.com"
          error={state.fieldErrors?.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use at least 8 characters."
          error={state.fieldErrors?.password}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={pending}>
          Create account
        </Button>
      </form>
    </div>
  );
}
