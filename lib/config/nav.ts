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
  { label: 'AI Studio', href: '/dashboard/create', icon: 'sparkles', description: 'Ask for any post' },
  { label: 'Content Planner', href: '/dashboard/planner', icon: 'calendar-range', description: 'Your content strategy' },
  { label: 'Social Accounts', href: '/dashboard/social', icon: 'share', description: 'Connect platforms' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'chart', description: 'Performance' },
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
