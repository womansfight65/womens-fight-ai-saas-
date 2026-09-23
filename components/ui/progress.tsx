import { cn } from '@/lib/utils/cn';

export function Progress({
  value,
  label,
  className,
  tone = 'brand',
}: {
  value: number;
  label?: string;
  className?: string;
  tone?: 'brand' | 'neutral';
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>{label}</span>
          <span className="font-medium text-ink-soft">{safe}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-premium',
            tone === 'brand' ? 'bg-brand-gradient' : 'bg-ink-faint',
          )}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
