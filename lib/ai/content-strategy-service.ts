import 'server-only';

import { getStore } from '@/lib/data';
import { logger } from '@/lib/utils/logger';
import { addDaysISO, todayISO } from '@/lib/utils/date';
import { normalizeHashtags } from '@/lib/utils/text';
import { notificationService } from '@/lib/notifications/notification-service';
import { usageService } from '@/lib/usage/usage-service';
import type { ContentItem, ContentPlan, PlatformId, SupportedLanguage, UUID } from '@/types';
import { aiService } from './ai-service';
import { businessBrainService } from './business-brain-service';
import { planSystemPrompt } from './prompts';
import { contentPlanSchema } from './schemas';

export interface GeneratePlanInput {
  workspaceId: UUID;
  userId: UUID;
  days?: number;
  startDate?: string;
  language?: SupportedLanguage;
  platforms?: PlatformId[];
  title?: string;
}

export interface GeneratePlanResult {
  plan: ContentPlan;
  items: ContentItem[];
  isMock: boolean;
}

/**
 * Turns the Business Brain into a month of content. This is the core feature,
 * so it writes a plan row first, then fills it — a failure leaves a visible
 * failed plan rather than a silent nothing.
 */
class ContentStrategyService {
  async generatePlan(input: GeneratePlanInput): Promise<GeneratePlanResult> {
    const store = await getStore();
    const days = Math.min(Math.max(input.days ?? 30, 1), 31);
    const startDate = input.startDate ?? todayISO();

    const brain = await businessBrainService.load(input.workspaceId);
    const language: SupportedLanguage =
      input.language ?? brain.brand?.preferred_language ?? 'en';
    const platforms: PlatformId[] =
      input.platforms?.length
        ? input.platforms
        : brain.business?.preferred_platforms?.length
          ? brain.business.preferred_platforms
          : ['facebook', 'instagram'];

    const limitMessage = await usageService.checkLimit(input.workspaceId, 'content_generation');
    if (limitMessage) throw new Error(limitMessage);

    const plan = await store.createPlan({
      workspace_id: input.workspaceId,
      title: input.title ?? `${days}-day content plan`,
      start_date: startDate,
      days,
      status: 'generating',
      strategy_summary: null,
    });

    try {
      const { data, result } = await aiService.completeJSON(
        contentPlanSchema,
        {
          system: planSystemPrompt({ brain, days, startDate, language, platforms }),
          messages: [
            {
              role: 'user',
              content: `Create my ${days}-day content plan starting ${startDate}.`,
            },
          ],
          task: 'plan',
          maxTokens: 16000,
          context: {
            days,
            language,
            platforms,
            businessName: brain.business?.business_name ?? 'your business',
            industry: brain.business?.industry ?? 'small business',
            audience: brain.business?.target_audience ?? 'your customers',
            products: brain.business?.products ?? [],
          },
        },
        { workspaceId: input.workspaceId, userId: input.userId },
      );

      const rows = data.days.slice(0, days).map((day, index) => ({
        workspace_id: input.workspaceId,
        plan_id: plan.id,
        day_number: day.day ?? index + 1,
        scheduled_date: addDaysISO(startDate, (day.day ?? index + 1) - 1),
        scheduled_time: /^\d{2}:\d{2}$/.test(day.suggested_time) ? day.suggested_time : '18:00',
        topic: day.topic,
        content_type: day.content_type,
        platform: day.platform,
        objective: day.objective,
        hook: day.hook,
        caption: day.caption,
        cta: day.cta,
        hashtags: normalizeHashtags(day.hashtags ?? []),
        image_concept: day.image_concept ?? null,
        video_concept: day.video_concept ?? null,
        language,
        status: 'generated' as const,
        approved_at: null,
      }));

      const items = await store.createContentItems(rows);
      const ready = await store.updatePlan(plan.id, {
        status: 'ready',
        strategy_summary: data.strategy_summary,
      });

      await usageService.record({
        workspaceId: input.workspaceId,
        userId: input.userId,
        metric: 'content_generation',
        quantity: items.length,
        metadata: { plan_id: plan.id },
      });

      await notificationService.notify({
        workspaceId: input.workspaceId,
        userId: input.userId,
        kind: 'plan_ready',
        title: 'Your 30-day plan is ready',
        body: `${items.length} pieces of content are waiting for your review.`,
        href: '/dashboard/planner',
      });

      await logger.info('strategy', 'Content plan generated', {
        workspaceId: input.workspaceId,
        plan_id: plan.id,
        count: items.length,
      });

      return { plan: ready ?? plan, items, isMock: result.isMock };
    } catch (error) {
      await store.updatePlan(plan.id, { status: 'failed' });
      await logger.error('strategy', 'Content plan generation failed', {
        workspaceId: input.workspaceId,
        plan_id: plan.id,
        message: error instanceof Error ? error.message : 'unknown',
      });
      throw error;
    }
  }

  async archivePlan(planId: UUID): Promise<void> {
    const store = await getStore();
    await store.updatePlan(planId, { status: 'archived' });
  }
}

export const contentStrategyService = new ContentStrategyService();
