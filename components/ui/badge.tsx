import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';
import { STATUS_LABELS } from '@/lib/config/platforms';
import type { ContentStatus } from '@/types';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-soft border-line',
  brand: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
  success: 'bg-state-success/10 text-state-success border-state-success/20',
  warning: 'bg-state-warning/10 text-state-warning border-state-warning/25',
  danger: 'bg-state-danger/10 text-state-danger border-state-danger/20',
  info: 'bg-state-info/10 text-state-info border-state-info/20',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ContentStatus, BadgeTone> = {
  draft: 'neutral',
  generated: 'info',
  approved: 'brand',
  scheduled: 'warning',
  published: 'success',
  failed: 'danger',
};

export function StatusBadge({ status, className }: { status: ContentStatus; className?: string }) {
  return (
    <Badge tone={STATUS_TONE[status]} className={className}>
      <span
        className={cn('h-1.5 w-1.5 rounded-full', {
          'bg-ink-faint': status === 'draft',
          'bg-state-info': status === 'generated',
          'bg-brand-purple': status === 'approved',
          'bg-state-warning': status === 'scheduled',
          'bg-state-success': status === 'published',
          'bg-state-danger': status === 'failed',
        })}
      />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
