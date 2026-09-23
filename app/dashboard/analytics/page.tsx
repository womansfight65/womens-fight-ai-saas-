import type { Metadata } from 'next';
import { BarChart3, Link2 } from 'lucide-react';

import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/states';
import { requireSession } from '@/lib/auth/guards';
import { analyticsService, type PlatformAnalytics } from '@/lib/analytics/analytics-service';

export const metadata: Metadata = { title: 'Analytics' };

const FUTURE_METRICS = [
  'Posts', 'Reach', 'Impressions', 'Likes', 'Comments', 'Shares', 'Saves', 'Views',
  'Engagement rate', 'Follower growth',
];

export default async function AnalyticsPage() {
  const session = await requireSession('/dashboard/analytics');
  const summary = await analyticsService.summary(session.user.workspace_id);

  if (!summary.hasConnectedPlatform) {
    return (
      <>
        <PageHeader
          title="Analytics"
          description="Numbers come from the platforms themselves. Nothing here is estimated or filled in."
        />
        <div className="space-y-6">
          <EmptyState
            icon={<BarChart3 className="h-5 w-5" />}
            title="No platform is connected, so there is nothing to measure."
            description="Analytics reads from the platforms you publish to. Connect an account and metrics start flowing in after your first published post."
            action={
              <ButtonLink href="/dashboard/social" icon={<Link2 className="h-4 w-4" />}>
                Social accounts
              </ButtonLink>
            }
          />

          <Card>
            <CardHeader
              title="What will be tracked"
              description="Every metric below is read from the platform APIs once publishing is connected."
            />
            <CardBody className="flex flex-wrap gap-2 pt-2">
              {FUTURE_METRICS.map((metric) => (
                <span
                  key={metric}
                  className="rounded-full border border-line bg-surface-soft px-3 py-1.5 text-xs text-ink-muted"
                >
                  {metric}
                </span>
              ))}
            </CardBody>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Numbers come from the platforms themselves. Nothing here is estimated or filled in."
      />

      <div className="space-y-6">
        {summary.hasData ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Posts" value={summary.totals.posts} />
            <StatCard label="Reach" value={summary.totals.reach.toLocaleString()} tone="brand" />
            <StatCard
              label="Engagement"
              value={(summary.totals.likes + summary.totals.comments + summary.totals.shares + summary.totals.saves).toLocaleString()}
            />
            <StatCard label="Follower change" value={summary.totals.followerDelta.toLocaleString()} />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface-soft px-5 py-4 text-sm text-ink-muted">
            No performance data across your connected accounts yet — it appears once your published posts have been live for a while.
          </div>
        )}

        {summary.insights.length ? (
          <Card>
            <CardHeader title="Observations" description="Computed from your own numbers." />
            <CardBody className="space-y-2.5 pt-2">
              {summary.insights.map((insight) => (
                <p key={insight} className="rounded-2xl bg-surface-soft px-4 py-3 text-sm text-ink-soft">
                  {insight}
                </p>
              ))}
            </CardBody>
          </Card>
        ) : null}

        <div>
          <h2 className="text-base font-semibold text-ink">By platform</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Every connected account gets its own numbers — nothing is shared or averaged across platforms.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {summary.byPlatform.map((platform) => (
              <PlatformOverview key={platform.platform} platform={platform} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function PlatformOverview({ platform }: { platform: PlatformAnalytics }) {
  const engagement =
    platform.totals.likes + platform.totals.comments + platform.totals.shares + platform.totals.saves;

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-2xs font-bold text-white"
              style={{ backgroundColor: platform.accent }}
              aria-hidden
            >
              {platform.name.slice(0, 1)}
            </span>
            {platform.name}
          </span>
        }
        description={platform.displayName ?? undefined}
        action={<Badge tone="success">Connected</Badge>}
      />
      <CardBody className="pt-2">
        {platform.hasData ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Posts" value={platform.totals.posts} />
            <MiniStat label="Reach" value={platform.totals.reach.toLocaleString()} />
            <MiniStat label="Engagement" value={engagement.toLocaleString()} />
            <MiniStat label="Followers" value={platform.totals.followerDelta.toLocaleString()} />
          </div>
        ) : (
          <p className="rounded-2xl bg-surface-soft px-4 py-3 text-sm text-ink-muted">
            No published posts on {platform.name} yet — numbers appear here once one has been live for a while.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-soft px-3.5 py-3">
      <p className="text-2xs font-medium uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
