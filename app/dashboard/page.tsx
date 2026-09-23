import type { Metadata } from 'next';
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Send,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/states';
import { requireSession } from '@/lib/auth/guards';
import { getStore } from '@/lib/data';
import { businessBrainService, computeCompleteness } from '@/lib/ai/business-brain-service';
import { socialService } from '@/lib/social/social-service';
import { formatDate, greetingFor, todayISO } from '@/lib/utils/date';
import { PLATFORMS } from '@/lib/config/platforms';
import { truncate } from '@/lib/utils/text';

export const metadata: Metadata = { title: 'Dashboard' };

const GREETING = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
} as const;

export default async function DashboardPage() {
  const session = await requireSession('/dashboard');
  const store = await getStore();

  const [stats, plan, business, upcoming, recent, connections] = await Promise.all([
    store.countContentByStatus(session.user.workspace_id),
    store.getLatestPlan(session.user.workspace_id),
    store.getBusinessProfile(session.user.workspace_id),
    store.listContentItems(session.user.workspace_id, { from: todayISO(), limit: 5 }),
    store.listContentItems(session.user.workspace_id, { limit: 60 }),
    socialService.listConnections(session.user.workspace_id),
  ]);

  const planItems = plan
    ? await store.listContentItems(session.user.workspace_id, { planId: plan.id })
    : [];
  const planReady = planItems.filter((i) =>
    ['approved', 'scheduled', 'published'].includes(i.status),
  ).length;

  const nextPost = upcoming[0] ?? null;
  const recentItems = [...recent].reverse().slice(0, 5);
  const connected = connections.filter((c) => c.status === 'connected');
  const brainComplete = computeCompleteness(business);
  const firstName = session.user.full_name?.split(' ')[0];

  /* Suggestions are derived from the workspace's real state, never invented. */
  const suggestions: Array<{ text: string; href: string; cta: string }> = [];
  if (!businessBrainService.isReady(business)) {
    suggestions.push({
      text: 'Your Business Brain is still thin. A few more answers make every generation sharper.',
      href: '/onboarding',
      cta: 'Continue onboarding',
    });
  }
  if (!plan) {
    suggestions.push({
      text: 'You have no content plan yet. Build one and the month fills itself in.',
      href: '/dashboard/planner',
      cta: 'Create a plan',
    });
  }
  if (stats.generated > 0) {
    suggestions.push({
      text: `${stats.generated} ${stats.generated === 1 ? 'post is' : 'posts are'} waiting for your review.`,
      href: '/dashboard/library',
      cta: 'Review them',
    });
  }
  if (stats.approved > 0) {
    suggestions.push({
      text: `${stats.approved} approved ${stats.approved === 1 ? 'post is' : 'posts are'} not scheduled yet.`,
      href: '/dashboard/calendar',
      cta: 'Open calendar',
    });
  }
  if (!connected.length) {
    suggestions.push({
      text: 'No social account is connected, so scheduled posts stay queued rather than publishing.',
      href: '/dashboard/social',
      cta: 'See platforms',
    });
  }

  return (
    <>
      <PageHeader
        title={`${GREETING[greetingFor()]}${firstName ? `, ${firstName}` : ''}`}
        description="Here is where your month stands."
        action={
          <ButtonLink href="/dashboard/create" icon={<Sparkles className="h-4 w-4" />}>
            Create with AI
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Drafts" value={stats.draft + stats.generated} icon={<FileText className="h-4 w-4" />} hint="Waiting for review" />
        <StatCard label="Approved" value={stats.approved} icon={<CheckCircle2 className="h-4 w-4" />} hint="Ready to schedule" tone="brand" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={<CalendarClock className="h-4 w-4" />} hint="In the queue" />
        <StatCard label="Published" value={stats.published} icon={<Send className="h-4 w-4" />} hint="Confirmed by a platform" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Next post */}
        <Card>
          <CardHeader
            title="Next up"
            description={nextPost ? 'The next thing on your calendar.' : undefined}
            action={<ButtonLink href="/dashboard/calendar" variant="ghost" size="sm">Calendar</ButtonLink>}
          />
          <CardBody>
            {nextPost ? (
              <div className="rounded-2xl border border-line bg-surface-soft p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-2xs font-bold text-white"
                    style={{ backgroundColor: PLATFORMS[nextPost.platform].accent }}
                    aria-hidden
                  >
                    {PLATFORMS[nextPost.platform].name.slice(0, 1)}
                  </span>
                  <span className="text-sm font-medium text-ink">{PLATFORMS[nextPost.platform].name}</span>
                  <StatusBadge status={nextPost.status} />
                  <span className="ml-auto text-sm text-ink-muted">
                    {formatDate(nextPost.scheduled_date, 'd MMM')} · {nextPost.scheduled_time}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">{nextPost.topic}</h3>
                <p
                  lang={nextPost.language === 'bn' ? 'bn' : undefined}
                  className="mt-2 text-sm leading-relaxed text-ink-muted"
                >
                  {truncate(nextPost.hook || nextPost.caption, 180)}
                </p>
              </div>
            ) : (
              <EmptyState
                title="Nothing scheduled ahead."
                description="Approve some content and give it a date, or ask the assistant for something new."
                action={<ButtonLink href="/dashboard/create" size="sm">Create with AI</ButtonLink>}
                className="border-0 bg-transparent py-8"
              />
            )}
          </CardBody>
        </Card>

        {/* Plan progress */}
        <Card>
          <CardHeader title="This month" />
          <CardBody className="space-y-5">
            {plan ? (
              <>
                <Progress value={planItems.length ? (planReady / planItems.length) * 100 : 0} label={`${planReady} / ${planItems.length} content ready`} />
                <Progress value={brainComplete} label="Business Brain" tone="neutral" />
                <ButtonLink href="/dashboard/planner" variant="outline" size="sm" fullWidth iconRight={<ArrowRight className="h-4 w-4" />}>
                  Open the plan
                </ButtonLink>
              </>
            ) : (
              <div className="space-y-4">
                <Progress value={brainComplete} label="Business Brain" />
                <p className="text-sm text-ink-muted">
                  No plan yet. Build one from what the assistant already knows.
                </p>
                <ButtonLink href="/dashboard/planner" size="sm" fullWidth>
                  Create my 30-day plan
                </ButtonLink>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent content */}
        <Card>
          <CardHeader
            title="Recent content"
            action={<ButtonLink href="/dashboard/library" variant="ghost" size="sm">Library</ButtonLink>}
          />
          <CardBody className="pt-2">
            {recentItems.length ? (
              <ul className="divide-y divide-line">
                {recentItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-3.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-2xs font-bold text-white"
                      style={{ backgroundColor: PLATFORMS[item.platform].accent }}
                      aria-hidden
                    >
                      {PLATFORMS[item.platform].name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.topic}</p>
                      <p className="text-xs text-ink-muted">{formatDate(item.scheduled_date, 'd MMM')}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-ink-muted">Nothing created yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader title="Suggestions" description="Based on what is actually in your workspace." />
          <CardBody className="space-y-3 pt-2">
            {suggestions.length ? (
              suggestions.slice(0, 4).map((suggestion) => (
                <div key={suggestion.cta} className="rounded-2xl border border-line bg-surface-soft p-4">
                  <p className="text-sm text-ink-soft">{suggestion.text}</p>
                  <ButtonLink href={suggestion.href} variant="ghost" size="sm" className="mt-2 !px-0">
                    {suggestion.cta} →
                  </ButtonLink>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-line bg-surface-soft p-4">
                <Badge tone="success">All clear</Badge>
                <p className="mt-2 text-sm text-ink-soft">
                  Nothing needs your attention right now.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
