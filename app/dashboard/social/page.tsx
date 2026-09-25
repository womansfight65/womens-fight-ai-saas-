import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/components/dashboard/page-header';
import { PlatformCard } from '@/components/social/platform-card';
import { SocialCallbackToast } from '@/components/social/social-callback-toast';
import { Card, CardBody } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/guards';
import { socialService } from '@/lib/social/social-service';

export const metadata: Metadata = { title: 'Social accounts' };

export default async function SocialPage() {
  const session = await requireSession('/dashboard/social');
  const connections = await socialService.listConnections(session.user.workspace_id);

  return (
    <>
      <SocialCallbackToast />
      <PageHeader
        title="Social accounts"
        description="Connect the platforms you publish to. Until a platform is genuinely connected, this page says so."
      />

      <Card className="mb-6">
        <CardBody className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-brand-purple">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div className="text-sm leading-relaxed text-ink-muted">
            <p className="font-medium text-ink">Approved content still waits for you.</p>
            <p className="mt-1">
              Connecting an account does not hand over control. Posts are queued only after you approve
              them, and a post is marked published only when the platform confirms it.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {connections.map((connection) => (
          <PlatformCard key={connection.platform} connection={connection} />
        ))}
      </div>
    </>
  );
}
