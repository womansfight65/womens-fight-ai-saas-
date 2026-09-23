'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

import { formatDateTime } from '@/lib/utils/date';
import { markNotificationsReadAction } from '@/app/dashboard/actions';
import type { Notification } from '@/types';

export function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read_at).length;

  useEffect(() => setItems(notifications), [notifications]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setItems((current) => current.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      await markNotificationsReadAction();
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-full border border-line bg-white p-2.5 text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-pink" />
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-scale-in">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
          </div>
          <div className="wf-scroll max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted">Nothing yet.</p>
            ) : (
              items.map((item) => {
                const body = (
                  <>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    {item.body ? <p className="mt-0.5 text-xs text-ink-muted">{item.body}</p> : null}
                    <p className="mt-1 text-2xs text-ink-faint">{formatDateTime(item.created_at)}</p>
                  </>
                );
                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block border-b border-line/70 px-4 py-3 transition-colors last:border-0 hover:bg-surface-soft"
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={item.id} className="border-b border-line/70 px-4 py-3 last:border-0">
                    {body}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
