'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { Logo } from '@/components/ui/logo';
import { SidebarNav } from './sidebar-nav';
import type { NavItem } from '@/lib/config/nav';

export function MobileNav({ items, footer }: { items: NavItem[]; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const overlay = open ? (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/35 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
      <div className="relative flex h-full w-[min(310px,85vw)] flex-col bg-surface-muted p-5 shadow-lift animate-slide-in-right">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="rounded-full p-2 text-ink-muted hover:bg-white hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="wf-scroll flex-1 overflow-y-auto">
          <SidebarNav items={items} onNavigate={() => setOpen(false)} />
        </div>
        {footer ? <div className="mt-5 border-t border-line pt-5">{footer}</div> : null}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="rounded-full p-2 text-ink transition-colors hover:bg-surface-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/*
       * Portalled to <body> — the header this button lives in has a
       * backdrop-filter (the frosted-glass blur), and any ancestor with a
       * transform/filter/backdrop-filter becomes the containing block for a
       * `position: fixed` descendant. Left in place, this drawer would be
       * clipped to the header's own height instead of covering the screen.
       */}
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
