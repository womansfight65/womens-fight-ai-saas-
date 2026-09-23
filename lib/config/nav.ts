import type { LucideIcon } from 'lucide-react';
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
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const dashboardNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Today at a glance' },
  { label: 'Create with AI', href: '/dashboard/create', icon: Sparkles, description: 'Ask for any post' },
  { label: '30-Day Plan', href: '/dashboard/planner', icon: CalendarRange, description: 'Your content strategy' },
  { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays, description: 'Month view' },
  { label: 'Library', href: '/dashboard/library', icon: Library, description: 'Every piece of content' },
  { label: 'Social Accounts', href: '/dashboard/social', icon: Share2, description: 'Connect platforms' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance' },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'Account and brand' },
];

export const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'AI Usage', href: '/admin/usage', icon: Activity },
  { label: 'Publishing', href: '/admin/publishing', icon: Send },
  { label: 'System Logs', href: '/admin/logs', icon: ScrollText },
];
