import { Info } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { integrations } from '@/lib/config/env';

/**
 * Says out loud which integrations are missing. The product never quietly
 * substitutes a placeholder for the real thing.
 */
export function DevModeNotice({ className }: { className?: string }) {
  const missing: string[] = [];
  if (!integrations.supabase) missing.push('Supabase');
  if (!integrations.claude) missing.push('Claude API');

  if (!missing.length) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-state-warning/30 bg-state-warning/5 px-4 py-3',
        className,
      )}
      role="status"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-state-warning" aria-hidden />
      <p className="text-xs leading-relaxed text-ink-soft">
        <span className="font-semibold text-ink">Development mode.</span>{' '}
        {missing.join(' and ')} {missing.length > 1 ? 'are' : 'is'} not configured, so the app is running
        on a local store and a labelled placeholder assistant. Add the keys in{' '}
        <code className="rounded bg-white px-1 py-0.5 text-[11px]">.env.local</code> to switch to the real
        services.
      </p>
    </div>
  );
}
