'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  CalendarRange,
  CalendarDays,
  Library,
  Share2,
  BarChart3,
  Settings,
  Users,
  CreditCard,
  FileText,
  Activity,
  Send,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import type { IconName, NavItem } from '@/lib/config/nav';

/*
 * Icons are looked up here, inside a Client Component, instead of being
 * stored as component references in lib/config/nav.ts. A function can't
 * cross the Server -> Client Component boundary, so the nav data only
 * ever carries a plain string name.
 */
const ICONS: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  sparkles: Sparkles,
  'calendar-range': CalendarRange,
  'calendar-days': CalendarDays,
  library: Library,
  share: Share2,
  chart: BarChart3,
  settings: Settings,
  users: Users,
  'credit-card': CreditCard,
  'file-text': FileText,
  activity: Activity,
  send: Send,
  'scroll-text': ScrollText,
};

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Sections">
      {items.map((item) => {
        const active = item.href === '/dashboard' || item.href === '/admin'
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-premium',
              active
                ? 'bg-white text-ink shadow-soft'
                : 'text-ink-muted hover:bg-white/70 hover:text-ink',
            )}
          >
            <Icon
              className={cn(
                'h-[18px] w-[18px] shrink-0 transition-colors',
                active ? 'text-brand-purple' : 'text-ink-faint group-hover:text-ink-soft',
              )}
              aria-hidden
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
