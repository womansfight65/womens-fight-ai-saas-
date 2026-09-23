import 'server-only';

import { getStore } from '@/lib/data';
import { todayISO } from '@/lib/utils/date';
import { normalizeHashtags } from '@/lib/utils/text';
import { usageService } from '@/lib/usage/usage-service';
import type { ContentItem, SupportedLanguage, UUID } from '@/types';
import { aiService } from './ai-service';
import { businessBrainService } from './business-brain-service';
import { detectLanguage, resolveContentLanguage } from './language';
import { contentSystemPrompt } from './prompts';
import { generatedContentSchema, type GeneratedContent } from './schemas';

export interface GenerateContentInput {
  workspaceId: UUID;
  userId: UUID;
  request: string;
  language?: SupportedLanguage;
}

export interface GenerateContentResult {
  content: GeneratedContent;
  language: SupportedLanguage;
  isMock: boolean;
}

/** Single-piece generation, used by Create with AI and by Regenerate. */
class ContentGenerationService {
  async generate(input: GenerateContentInput): Promise<GenerateContentResult> {
    const limitMessage = await usageService.checkLimit(input.workspaceId, 'content_generation');
    if (limitMessage) throw new Error(limitMessage);

    const brain = await businessBrainService.load(input.workspaceId);
    const detection = detectLanguage(input.request);
    const language =
      input.language ?? resolveContentLanguage(brain.brand?.preferred_language, detection.language);

    const { data, result } = await aiService.completeJSON(
      generatedContentSchema,
      {
        system: contentSystemPrompt({ brain, detection, language }),
        messages: [{ role: 'user', content: input.request }],
        task: 'content',
        maxTokens: 2000,
        context: {
          language,
          businessName: brain.business?.business_name ?? 'your business',
          audience: brain.business?.target_audience ?? 'your customers',
          products: brain.business?.products ?? [],
          platforms: brain.business?.preferred_platforms ?? [],
        },
      },
      { workspaceId: input.workspaceId, userId: input.userId },
    );

    await usageService.record({
      workspaceId: input.workspaceId,
      userId: input.userId,
      metric: 'text_generation',
      metadata: { platform: data.platform },
    });

    return { content: data, language, isMock: result.isMock };
  }

  /** Saves a generated piece as a draft the user can edit. */
  async saveAsDraft(params: {
    workspaceId: UUID;
    content: GeneratedContent;
    language: SupportedLanguage;
    scheduledDate?: string;
  }): Promise<ContentItem> {
    const store = await getStore();
    const [item] = await store.createContentItems([
      {
        workspace_id: params.workspaceId,
        plan_id: null,
        day_number: null,
        scheduled_date: params.scheduledDate ?? todayISO(),
        scheduled_time: /^\d{2}:\d{2}$/.test(params.content.suggested_time)
          ? params.content.suggested_time
          : '18:00',
        topic: params.content.topic,
        content_type: params.content.content_type,
        platform: params.content.platform,
        objective: params.content.objective,
        hook: params.content.hook,
        caption: params.content.caption,
        cta: params.content.cta,
        hashtags: normalizeHashtags(params.content.hashtags ?? []),
        image_concept: params.content.image_concept ?? null,
        video_concept: params.content.video_concept ?? null,
        language: params.language,
        status: 'draft',
        approved_at: null,
      },
    ]);
    return item;
  }

  /** Regenerates an existing item in place, keeping its date and platform. */
  async regenerate(params: {
    workspaceId: UUID;
    userId: UUID;
    itemId: UUID;
    instruction?: string;
  }): Promise<ContentItem | null> {
    const store = await getStore();
    const item = await store.getContentItem(params.itemId);
    if (!item || item.workspace_id !== params.workspaceId) return null;

    const request = [
      `Rewrite this ${item.platform} ${item.content_type} about "${item.topic}".`,
      `Objective: ${item.objective}.`,
      params.instruction ? `The user asked: ${params.instruction}` : 'Make it fresh and sharper.',
      'Keep the same platform and the same objective.',
    ].join(' ');

    const { content } = await this.generate({
      workspaceId: params.workspaceId,
      userId: params.userId,
      request,
      language: item.language,
    });

    return store.updateContentItem(item.id, {
      topic: content.topic || item.topic,
      hook: content.hook,
      caption: content.caption,
      cta: content.cta,
      hashtags: normalizeHashtags(content.hashtags ?? []),
      image_concept: content.image_concept ?? item.image_concept,
      video_concept: content.video_concept ?? item.video_concept,
      status: item.status === 'published' ? item.status : 'generated',
    });
  }
}

export const contentGenerationService = new ContentGenerationService();
