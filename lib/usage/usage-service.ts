import 'server-only';

import { getStore } from '@/lib/data';
import { getPlan } from '@/lib/config/plans';
import type { PlanLimits, UsageMetric, UUID } from '@/types';

export function currentPeriod(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export interface RecordUsageInput {
  workspaceId: UUID;
  userId?: UUID | null;
  metric: UsageMetric;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

export interface UsageSummary {
  period: string;
  planId: string;
  limits: PlanLimits;
  used: Record<UsageMetric, number>;
}

const METRICS: UsageMetric[] = [
  'ai_request',
  'text_generation',
  'image_generation',
  'video_generation',
  'content_generation',
  'publishing_job',
];

const LIMIT_BY_METRIC: Partial<Record<UsageMetric, keyof PlanLimits>> = {
  ai_request: 'ai_generations_per_month',
  content_generation: 'ai_generations_per_month',
  image_generation: 'image_generations_per_month',
  video_generation: 'video_generations_per_month',
  publishing_job: 'scheduled_posts_per_month',
};

/**
 * Usage accounting. Every AI call, media job and publishing job lands here, so
 * plan limits and the admin usage screen read from one place.
 */
class UsageService {
  async record(input: RecordUsageInput): Promise<void> {
    try {
      const store = await getStore();
      await store.addUsage({
        workspace_id: input.workspaceId,
        user_id: input.userId ?? null,
        metric: input.metric,
        quantity: input.quantity ?? 1,
        period: currentPeriod(),
        metadata: input.metadata ?? {},
      });
    } catch {
      // Usage accounting must never fail the user's request.
    }
  }

  async summary(workspaceId: UUID, period = currentPeriod()): Promise<UsageSummary> {
    const store = await getStore();
    const [records, subscription] = await Promise.all([
      store.listUsage(workspaceId, period),
      store.getSubscription(workspaceId),
    ]);
    const used = METRICS.reduce<Record<UsageMetric, number>>(
      (acc, metric) => {
        acc[metric] = records
          .filter((r) => r.metric === metric)
          .reduce((total, r) => total + r.quantity, 0);
        return acc;
      },
      {} as Record<UsageMetric, number>,
    );
    const plan = getPlan(subscription?.plan_id ?? 'free');
    return { period, planId: plan.id, limits: plan.limits, used };
  }

  /** Returns null when within limits, or a human message when the cap is hit. */
  async checkLimit(workspaceId: UUID, metric: UsageMetric): Promise<string | null> {
    const limitKey = LIMIT_BY_METRIC[metric];
    if (!limitKey) return null;
    const summary = await this.summary(workspaceId);
    const limit = summary.limits[limitKey];
    if (limit <= 0) return null;
    if (summary.used[metric] >= limit) {
      return `You have used all ${limit} of this month's allowance on the ${summary.planId} plan.`;
    }
    return null;
  }
}

export const usageService = new UsageService();
