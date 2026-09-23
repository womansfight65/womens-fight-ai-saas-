import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CalendarRange } from 'lucide-react';

import { ContentBrowser } from '@/components/content/content-browser';
import { GeneratePlanButton } from '@/components/planner/generate-plan-button';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { requireSession } from '@/lib/auth/guards';
import { getStore } from '@/lib/data';
import { businessBrainService, computeCompleteness } from '@/lib/ai/business-brain-service';
import { formatDate } from '@/lib/utils/date';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = { title: '30-day plan' };

export default async function PlannerPage() {
  const session = await requireSession('/dashboard/planner');
  const store = await getStore();

  const [plan, business] = await Promise.all([
    store.getLatestPlan(session.user.workspace_id),
    store.getBusinessProfile(session.user.workspace_id),
  ]);

  const items = plan ? await store.listContentItems(session.user.workspace_id, { planId: plan.id }) : [];
  const brainReady = businessBrainService.isReady(business);
  const approved = items.filter((i) => i.status === 'approved' || i.status === 'scheduled' || i.status === 'published').length;

  return (
    <>
      <PageHeader
        title="30-day content plan"
        description="A month of content with a purpose behind each day. Review, edit and approve what you want to keep."
        action={
          plan ? (
            <Suspense fallback={null}>
              <GeneratePlanButton label="Generate a new plan" variant="outline" />
            </Suspense>
          ) : null
        }
      />

      {!brainReady ? (
        <EmptyState
          icon={<CalendarRange className="h-5 w-5" />}
          title="Your Business Brain is not ready yet."
          description="The plan is written from what the assistant knows about your business. Finish the onboarding chat and it will have enough to work with."
          action={<ButtonLink href="/onboarding">Continue onboarding</ButtonLink>}
        />
      ) : !plan ? (
        <EmptyState
          icon={<CalendarRange className="h-5 w-5" />}
          title="You don't have a content plan yet."
          description="Build a month of content from your Business Brain. It takes about a minute."
          action={
            <Suspense fallback={<LoadingState label="Loading…" />}>
              <GeneratePlanButton autoStart />
            </Suspense>
          }
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardBody className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-semibold text-ink">{plan.title}</h2>
                  <Badge tone={plan.status === 'ready' ? 'success' : plan.status === 'failed' ? 'danger' : 'warning'}>
                    {plan.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  Starts {formatDate(plan.start_date)} · {plan.days} days
                </p>
                {plan.strategy_summary ? (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                    {plan.strategy_summary}
                  </p>
                ) : null}
              </div>

              <div className="w-full max-w-xs shrink-0 space-y-4">
                <Progress
                  value={items.length ? (approved / items.length) * 100 : 0}
                  label={`${approved} / ${items.length} content ready`}
                />
                <Progress
                  value={computeCompleteness(business)}
                  label="Business Brain"
                  tone="neutral"
                />
              </div>
            </CardBody>
          </Card>

          <ContentBrowser
            items={items}
            emptyTitle="This plan has no content."
            emptyDescription="Generate a new plan to fill it."
          />
        </div>
      )}
    </>
  );
}
