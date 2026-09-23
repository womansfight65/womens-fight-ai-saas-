'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMonths, format, isSameDay, isSameMonth, isToday, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ContentEditor } from '@/components/content/content-editor';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { monthGrid } from '@/lib/utils/date';
import { PLATFORMS } from '@/lib/config/platforms';
import type { ContentItem } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ContentCalendar({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [activeDay, setActiveDay] = useState<Date | null>(null);

  const days = useMemo(() => monthGrid(cursor), [cursor]);

  const byDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const item of items) {
      const list = map.get(item.scheduled_date) ?? [];
      list.push(item);
      map.set(item.scheduled_date, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
    return map;
  }, [items]);

  const dayItems = activeDay ? (byDate.get(format(activeDay, 'yyyy-MM-dd')) ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{format(cursor, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous month"
            onClick={() => setCursor((c) => subMonths(c, 1))}
            className="!px-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next month"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="!px-3"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
        <div className="grid grid-cols-7 border-b border-line bg-surface-soft">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-3 text-center text-2xs font-semibold uppercase tracking-wider text-ink-faint">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayContent = byDate.get(key) ?? [];
            const outside = !isSameMonth(day, cursor);
            const isActive = activeDay ? isSameDay(day, activeDay) : false;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDay(day)}
                aria-label={`${format(day, 'd MMMM yyyy')}, ${dayContent.length} items`}
                className={cn(
                  'min-h-[92px] border-b border-r border-line p-2 text-left align-top transition-colors last:border-r-0 sm:min-h-[124px]',
                  outside && 'bg-surface-soft/60',
                  isActive && 'bg-brand-purple/[0.05]',
                  'hover:bg-surface-soft focus-visible:relative focus-visible:z-10',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                    isToday(day) ? 'bg-brand-gradient text-white' : outside ? 'text-ink-faint' : 'text-ink-soft',
                  )}
                >
                  {format(day, 'd')}
                </span>

                <div className="mt-1.5 space-y-1">
                  {dayContent.slice(0, 2).map((item) => (
                    <span
                      key={item.id}
                      className="flex items-center gap-1.5 rounded-md bg-surface-muted px-1.5 py-1 text-2xs text-ink-soft"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: PLATFORMS[item.platform].accent }}
                        aria-hidden
                      />
                      <span className="truncate">{item.topic}</span>
                    </span>
                  ))}
                  {dayContent.length > 2 ? (
                    <span className="block px-1.5 text-2xs text-ink-faint">
                      +{dayContent.length - 2} more
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeDay ? (
        <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">{format(activeDay, 'EEEE d MMMM')}</h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveDay(null)}>
              Close
            </Button>
          </div>

          {dayItems.length ? (
            <ul className="mt-4 divide-y divide-line">
              {dayItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-surface-soft"
                  >
                    <span className="w-12 shrink-0 text-xs font-medium text-ink-muted">
                      {item.scheduled_time}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{item.topic}</span>
                      <span className="block text-xs text-ink-muted">{PLATFORMS[item.platform].name}</span>
                    </span>
                    <StatusBadge status={item.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">Nothing on this day.</p>
          )}
        </div>
      ) : null}

      <ContentEditor
        item={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}
