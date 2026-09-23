import type { Metadata } from 'next';
import { BarChart3, Link2 } from 'lucide-react';

import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/states';
import { requireSession } from '@/lib/auth/guards';
import { analyticsService } from '@/lib/analytics/analytics-service';

export const metadata: Metadata = { title: 'Analytics' };

const FUTURE_METRICS = [
  'Posts', 'Reach', 'Impressions', 'Likes', 'Comments', 'Shares', 'Saves', 'Views',
  'Engagement rate', 'Follower growth',
];

export default async function AnalyticsPage() {
  const session = await requireSession('/dashboard/analytics');
  const summary = await analyticsService.summary(session.user.workspace_id);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Numbers come from the platforms themselves. Nothing here is estimated or filled in."
      />

      {!summary.hasData ? (
        <div className="space-y-6">
          <EmptyState
            icon={<BarChart3 className="h-5 w-5" />}
            title={
              summary.hasConnectedPlatform
                ? 'No performance data yet.'
                : 'No platform is connected, so there is nothing to measure.'
            }
            description={
              summary.hasConnectedPlatform
                ? 'Once your published posts have been live for a while, their metrics will appear here.'
                : 'Analytics reads from the platforms you publish to. Connect an account and metrics start flowing in after your first published post.'
            }
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
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Posts" value={summary.totals.posts} />
            <StatCard label="Reach" value={summary.totals.reach.toLocaleString()} tone="brand" />
            <StatCard label="Engagement" value={(summary.totals.likes + summary.totals.comments + summary.totals.shares + summary.totals.saves).toLocaleString()} />
            <StatCard label="Follower change" value={summary.totals.followerDelta.toLocaleString()} />
          </div>

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
        </div>
      )}
    </>
  );
}
