import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BarChart3, Eye, Heart, Link2, Users } from 'lucide-react';

import { PageHeader } from '@/components/dashboard/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { MultiLineChart, Sparkline } from '@/components/ui/chart';
import { PlatformIcon } from '@/components/ui/platform-icon';
import { EmptyState } from '@/components/ui/states';
import { requireSession } from '@/lib/auth/guards';
import { PLATFORMS } from '@/lib/config/platforms';
import { analyticsService, type PlatformAnalytics, type SeriesPoint } from '@/lib/analytics/analytics-service';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = { title: 'Analytics' };

const FUTURE_METRICS = [
  'Posts', 'Reach', 'Impressions', 'Likes', 'Comments', 'Shares', 'Saves', 'Views',
  'Engagement rate', 'Follower growth',
];

/** A real, honest period-over-period change — first half of the series vs the second half. Never shown when there isn't enough data to mean anything. */
function trendPercent(series: SeriesPoint[], key: 'reach' | 'engagement'): number | null {
  if (series.length < 4) return null;
  const mid = Math.floor(series.length / 2);
  const first = series.slice(0, mid).reduce((sum, p) => sum + p[key], 0);
  const second = series.slice(mid).reduce((sum, p) => sum + p[key], 0);
  if (first <= 0) return null;
  return Math.round(((second - first) / first) * 100);
}

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

  const engagement =
    summary.totals.likes + summary.totals.comments + summary.totals.shares + summary.totals.saves;
  const reachTrend = trendPercent(summary.series, 'reach');
  const engagementTrend = trendPercent(summary.series, 'engagement');

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Numbers come from the platforms themselves. Nothing here is estimated or filled in."
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon={<Eye className="h-4 w-4" />} tone="blue" label="Total reach" value={summary.totals.reach} trend={reachTrend} />
          <KpiCard icon={<Heart className="h-4 w-4" />} tone="pink" label="Total engagement" value={engagement} trend={engagementTrend} />
          <KpiCard icon={<Users className="h-4 w-4" />} tone="purple" label="Follower change" value={summary.totals.followerDelta} />
          <KpiCard icon={<BarChart3 className="h-4 w-4" />} tone="orange" label="Posts tracked" value={summary.totals.posts} />
        </div>

        <Card>
          <CardHeader
            title="Platform performance"
            description="Reach and engagement per day, across every connected platform."
          />
          <CardBody className="pt-2">
            <div className="mb-4 flex flex-wrap gap-4">
              {summary.byPlatform.map((p) => (
                <span key={p.platform} className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORMS[p.platform].accent }} />
                  {p.name}
                </span>
              ))}
            </div>
            <MultiLineChart
              lines={summary.byPlatform.map((p) => ({
                label: p.name,
                color: PLATFORMS[p.platform].accent,
                points: p.series.map((s) => ({ date: s.date, value: s.reach })),
              }))}
            />
          </CardBody>
        </Card>

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

const KPI_TONES = {
  blue: { bg: 'bg-[#EAF2FE]', text: 'text-[#1877F2]' },
  pink: { bg: 'bg-[#FDEAF2]', text: 'text-[#E1306C]' },
  purple: { bg: 'bg-brand-purple/10', text: 'text-brand-purple' },
  orange: { bg: 'bg-[#FFF1E6]', text: 'text-[#E8720C]' },
} as const;

function KpiCard({
  icon,
  tone,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  tone: keyof typeof KPI_TONES;
  label: string;
  value: number;
  trend?: number | null;
}) {
  const t = KPI_TONES[tone];
  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-2xl', t.bg, t.text)}>{icon}</span>
        {trend !== null && trend !== undefined ? (
          <span className={cn('text-xs font-semibold', trend >= 0 ? 'text-state-success' : 'text-state-danger')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
      <p className="mt-3.5 text-xs font-medium uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{value.toLocaleString()}</p>
    </div>
  );
}

function PlatformOverview({ platform }: { platform: PlatformAnalytics }) {
  const engagement =
    platform.totals.likes + platform.totals.comments + platform.totals.shares + platform.totals.saves;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line p-5 pb-4">
        <PlatformIcon platform={platform.platform} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{platform.name}</p>
          <p className="truncate text-xs text-ink-muted">{platform.displayName ?? 'Connected account'}</p>
        </div>
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-state-success" aria-hidden />
      </div>

      <CardBody className="space-y-4 pt-4">
        {platform.hasData ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Posts" value={platform.totals.posts} />
              <MiniStat label="Reach" value={platform.totals.reach.toLocaleString()} />
              <MiniStat label="Engagement" value={engagement.toLocaleString()} />
            </div>
            <div>
              <p className="mb-1.5 text-2xs font-medium uppercase tracking-wider text-ink-faint">Reach trend</p>
              <Sparkline
                points={platform.series.map((s) => ({ date: s.date, value: s.reach }))}
                color={PLATFORMS[platform.platform].accent}
              />
            </div>
          </>
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
      <p className="mt-1 font-display text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
