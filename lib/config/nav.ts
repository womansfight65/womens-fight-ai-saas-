export type IconName =
  | 'dashboard'
  | 'sparkles'
  | 'calendar-range'
  | 'calendar-days'
  | 'library'
  | 'share'
  | 'chart'
  | 'settings'
  | 'users'
  | 'credit-card'
  | 'file-text'
  | 'activity'
  | 'send'
  | 'scroll-text';

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  description?: string;
}

export const dashboardNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard', description: 'Today at a glance' },
  { label: 'Create with AI', href: '/dashboard/create', icon: 'sparkles', description: 'Ask for any post' },
  { label: '30-Day Plan', href: '/dashboard/planner', icon: 'calendar-range', description: 'Your content strategy' },
  { label: 'Calendar', href: '/dashboard/calendar', icon: 'calendar-days', description: 'Month view' },
  { label: 'Library', href: '/dashboard/library', icon: 'library', description: 'Every piece of content' },
  { label: 'Social Accounts', href: '/dashboard/social', icon: 'share', description: 'Connect platforms' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'chart', description: 'Performance' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings', description: 'Account and brand' },
];

export const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: 'dashboard' },
  { label: 'Users', href: '/admin/users', icon: 'users' },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'credit-card' },
  { label: 'Content', href: '/admin/content', icon: 'file-text' },
  { label: 'AI Usage', href: '/admin/usage', icon: 'activity' },
  { label: 'Publishing', href: '/admin/publishing', icon: 'send' },
  { label: 'System Logs', href: '/admin/logs', icon: 'scroll-text' },
];
