import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { MobileNav } from '@/components/dashboard/mobile-nav';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { UserMenu } from '@/components/dashboard/user-menu';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { adminNav } from '@/lib/config/nav';
import { requireAdmin } from '@/lib/auth/guards';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side check on every request. Nothing about the admin area is
  // decided in the browser.
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface-muted px-4 py-5 lg:flex">
          <div className="px-2">
            <Logo href="/admin" />
            <Badge tone="brand" className="mt-3">Admin</Badge>
          </div>

          <div className="wf-scroll mt-6 flex-1 overflow-y-auto">
            <SidebarNav items={adminNav} />
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to app
          </Link>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
            <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <MobileNav items={adminNav} />
                <div className="lg:hidden">
                  <Logo href="/admin" showWordmark={false} />
                </div>
                <Badge tone="brand" className="lg:hidden">Admin</Badge>
              </div>
              <UserMenu user={session.user} />
            </div>
          </header>

          <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
