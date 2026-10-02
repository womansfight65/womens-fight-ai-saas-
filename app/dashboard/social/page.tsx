import type { Metadata } from 'next';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/dashboard/page-header';
import { PlatformCard } from '@/components/social/platform-card';
import { SocialCallbackToast } from '@/components/social/social-callback-toast';
import { Card, CardBody } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { requireSession } from '@/lib/auth/guards';
import { socialService } from '@/lib/social/social-service';
import { billingService } from '@/lib/billing/billing-service';

export const metadata: Metadata = { title: 'Social accounts' };

export default async function SocialPage() {
  const session = await requireSession('/dashboard/social');
  const [connections, billing] = await Promise.all([
    socialService.listConnections(session.user.workspace_id),
    billingService.state(session.user.workspace_id),
  ]);
  const connectedCount = connections.filter((c) => c.status === 'connected').length;
  const limit = billing.plan.limits.connected_platforms;
  const atLimit = connectedCount >= limit;

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

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[220px] flex-1">
            <p className="text-sm font-medium text-ink">
              {connectedCount} of {limit} platform{limit === 1 ? '' : 's'} connected — {billing.plan.name} plan
            </p>
            <div className="mt-2 max-w-xs">
              <Progress value={limit > 0 ? (connectedCount / limit) * 100 : 0} />
            </div>
          </div>
          {atLimit ? (
            <ButtonLink href="/pricing" size="sm" icon={<Sparkles className="h-4 w-4" />}>
              Upgrade to connect more
            </ButtonLink>
          ) : null}
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
