import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: 'default' | 'brand';
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border p-5 transition-shadow duration-300',
        tone === 'brand'
          ? 'border-brand-purple/20 bg-brand-purple/[0.04]'
          : 'border-line bg-white shadow-soft',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">{label}</p>
        {icon ? <span className="text-ink-faint">{icon}</span> : null}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
