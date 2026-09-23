import Link from 'next/link';

import { MobileNav } from '@/components/dashboard/mobile-nav';
import { NotificationBell } from '@/components/dashboard/notification-bell';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { UserMenu } from '@/components/dashboard/user-menu';
import { DevModeNotice } from '@/components/shared/dev-mode-notice';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { dashboardNav } from '@/lib/config/nav';
import { requireSession } from '@/lib/auth/guards';
import { notificationService } from '@/lib/notifications/notification-service';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('/dashboard');
  const notifications = await notificationService.list(session.user.id, 15);

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-line bg-surface-muted px-4 py-5 lg:flex">
          <div className="px-2">
            <Logo />
          </div>

          <div className="wf-scroll mt-7 flex-1 overflow-y-auto">
            <SidebarNav items={dashboardNav} />
          </div>

          <div className="space-y-3 pt-4">
            {session.user.role === 'admin' ? (
              <Link
                href="/admin"
                className="block rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                Admin panel
              </Link>
            ) : null}
            <div className="rounded-2xl bg-ink p-4">
              <p className="text-sm font-semibold text-white">Need a post right now?</p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Ask the assistant in one line and approve it.
              </p>
              <ButtonLink href="/dashboard/create" size="sm" className="mt-3" fullWidth>
                Create with AI
              </ButtonLink>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
            <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <MobileNav
                  items={dashboardNav}
                  footer={
                    <ButtonLink href="/dashboard/create" size="sm" fullWidth>
                      Create with AI
                    </ButtonLink>
                  }
                />
                <div className="lg:hidden">
                  <Logo showWordmark={false} />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <NotificationBell notifications={notifications} />
                <UserMenu user={session.user} />
              </div>
            </div>
          </header>

          <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <DevModeNotice className="mb-5" />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
