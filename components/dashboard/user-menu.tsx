'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings, ShieldCheck } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { signOutAction } from '@/lib/auth/actions';
import type { SessionUser } from '@/types';

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2.5 transition-colors hover:border-line-strong"
      >
        <Avatar name={user.full_name ?? user.email} size="sm" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-ink sm:block">
          {user.full_name ?? user.email}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-60 overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-scale-in"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{user.full_name ?? 'Your account'}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>

          <div className="p-1.5">
            <Link
              href="/dashboard/settings"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <Settings className="h-4 w-4" aria-hidden />
              Settings
            </Link>

            {user.role === 'admin' ? (
              <Link
                href="/admin"
                role="menuitem"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Admin panel
              </Link>
            ) : null}
          </div>

          <form action={signOutAction} className="border-t border-line p-1.5">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-state-danger transition-colors hover:bg-state-danger/5"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
