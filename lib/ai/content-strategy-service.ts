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
import { ideaPlanSystemPrompt, planSystemPrompt } from './prompts';
import { contentPlanSchema } from './schemas';

export interface GenerateFromIdeasInput {
  workspaceId: UUID;
  userId: UUID;
  days: number;
  postsPerDay: number;
  ideaTranscript: string;
  startDate?: string;
  language?: SupportedLanguage;
  platforms?: PlatformId[];
}

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

  /**
   * The same pipeline as generatePlan, but driven by a content-ideas chat
   * instead of the 30-day cadence: an explicit day count and posts-per-day,
   * grounded in whatever the user actually said in that conversation.
   */
  async generateFromIdeas(input: GenerateFromIdeasInput): Promise<GeneratePlanResult> {
    const store = await getStore();
    const days = Math.min(Math.max(input.days, 1), 14);
    const postsPerDay = Math.min(Math.max(input.postsPerDay, 1), 6);
    const total = days * postsPerDay;
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
      title: `${days}-day plan · ${postsPerDay}/day (from chat)`,
      start_date: startDate,
      days,
      status: 'generating',
      strategy_summary: null,
    });

    try {
      const { data, result } = await aiService.completeJSON(
        contentPlanSchema,
        {
          system: ideaPlanSystemPrompt({
            brain,
            days,
            postsPerDay,
            totalPosts: total,
            startDate,
            language,
            platforms,
            ideaTranscript: input.ideaTranscript,
          }),
          messages: [
            {
              role: 'user',
              content: `Create ${total} posts across ${days} day(s) starting ${startDate}, ${postsPerDay} per day.`,
            },
          ],
          task: 'idea_plan',
          maxTokens: 16000,
          context: {
            days,
            postsPerDay,
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

      /* Multiple posts can land on the same day — space them out evenly instead
       * of trusting every model to pick distinct times on its own. */
      const seenPerDay = new Map<number, number>();
      const daySlots = ['10:00', '13:00', '16:00', '18:30', '20:00', '21:30'];

      const rows = data.days.slice(0, total).map((day) => {
        const dayNumber = Math.min(Math.max(day.day ?? 1, 1), days);
        const slot = seenPerDay.get(dayNumber) ?? 0;
        seenPerDay.set(dayNumber, slot + 1);
        return {
          workspace_id: input.workspaceId,
          plan_id: plan.id,
          day_number: dayNumber,
          scheduled_date: addDaysISO(startDate, dayNumber - 1),
          scheduled_time: daySlots[slot % daySlots.length],
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
        };
      });

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
        metadata: { plan_id: plan.id, source: 'content_idea_chat' },
      });

      await notificationService.notify({
        workspaceId: input.workspaceId,
        userId: input.userId,
        kind: 'plan_ready',
        title: 'Your posts are ready',
        body: `${items.length} pieces of content are waiting for your review.`,
        href: '/dashboard/library',
      });

      await logger.info('strategy', 'Content generated from idea chat', {
        workspaceId: input.workspaceId,
        plan_id: plan.id,
        count: items.length,
      });

      return { plan: ready ?? plan, items, isMock: result.isMock };
    } catch (error) {
      await store.updatePlan(plan.id, { status: 'failed' });
      await logger.error('strategy', 'Content generation from idea chat failed', {
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
