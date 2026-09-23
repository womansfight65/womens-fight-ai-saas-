'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInAction } from '@/lib/auth/actions';
import { initialFormState } from '@/lib/auth/form-state';
import { AuthLink } from './auth-shell';
import { FormMessage } from './form-message';

export function LoginForm() {
  const [state, action, pending] = useActionState(signInAction, initialFormState);
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
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

      <div className="space-y-1.5">
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.fieldErrors?.password}
          required
        />
        <div className="text-right text-sm">
          <AuthLink href="/forgot-password">Forgot password?</AuthLink>
        </div>
      </div>

      <Button type="submit" size="lg" fullWidth loading={pending}>
        Log in
      </Button>
    </form>
  );
}
