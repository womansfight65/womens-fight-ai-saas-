import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import type { FormState } from '@/lib/auth/form-state';

export function FormMessage({ state, className }: { state: FormState; className?: string }) {
  if (state.status === 'idle' || !state.message) return null;
  const isError = state.status === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm',
        isError
          ? 'border-state-danger/25 bg-state-danger/5 text-ink'
          : 'border-state-success/25 bg-state-success/5 text-ink',
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 h-4 w-4 shrink-0', isError ? 'text-state-danger' : 'text-state-success')}
        aria-hidden
      />
      <div className="space-y-1">
        <p>{state.message}</p>
        {state.devHint ? (
          <p className="text-xs text-ink-muted">
            {state.devHint.split(': ')[0]}:{' '}
            <a
              className="font-medium text-brand-purple hover:underline"
              href={state.devHint.split(': ').slice(1).join(': ')}
            >
              open reset link
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
