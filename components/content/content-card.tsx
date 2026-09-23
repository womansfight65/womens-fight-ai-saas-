'use client';

import { CalendarDays, Clock } from 'lucide-react';

import { Badge, StatusBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/date';
import { truncate } from '@/lib/utils/text';
import { CONTENT_TYPE_LABELS, OBJECTIVE_LABELS, PLATFORMS } from '@/lib/config/platforms';
import type { ContentItem } from '@/types';

export function ContentCard({
  item,
  onOpen,
  className,
}: {
  item: ContentItem;
  onOpen: (item: ContentItem) => void;
  className?: string;
}) {
  const platform = PLATFORMS[item.platform];

  return (
    <article
      className={cn(
        'group flex flex-col rounded-3xl border border-line bg-white p-5 text-left shadow-soft transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-brand-purple/25 hover:shadow-lift',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex flex-1 flex-col text-left focus-visible:outline-none"
        aria-label={`Open ${item.topic}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-2xs font-bold text-white"
              style={{ backgroundColor: platform.accent }}
              aria-hidden
            >
              {platform.name.slice(0, 1)}
            </span>
            <span className="text-xs font-medium text-ink-muted">{platform.name}</span>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <h3 className="mt-3.5 text-sm font-semibold leading-snug text-ink">
          {item.day_number ? (
            <span className="mr-1.5 text-ink-faint">Day {item.day_number}</span>
          ) : null}
          {item.topic}
        </h3>

        <p
          lang={item.language === 'bn' ? 'bn' : undefined}
          className={cn(
            'mt-2 flex-1 text-sm leading-relaxed text-ink-muted',
            item.language === 'bn' && 'font-bangla',
          )}
        >
          {truncate(item.hook || item.caption, 120)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{CONTENT_TYPE_LABELS[item.content_type]}</Badge>
          <Badge tone="brand">{OBJECTIVE_LABELS[item.objective]}</Badge>
        </div>
      </button>

      <div className="mt-4 flex items-center gap-4 border-t border-line pt-3.5 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          {formatDate(item.scheduled_date, 'd MMM')}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {item.scheduled_time}
        </span>
      </div>
    </article>
  );
}
