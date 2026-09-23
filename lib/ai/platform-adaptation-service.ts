import 'server-only';

import { getStore } from '@/lib/data';
import { normalizeHashtags } from '@/lib/utils/text';
import type { ContentItem, ContentVariation, PlatformId, UUID } from '@/types';
import { aiService } from './ai-service';
import { adaptationSystemPrompt } from './prompts';
import { adaptedContentSchema } from './schemas';

/**
 * The same idea, rewritten per platform. Copy-pasting one caption everywhere is
 * exactly what this product exists to stop.
 */
class PlatformAdaptationService {
  async adapt(params: {
    workspaceId: UUID;
    userId: UUID;
    item: ContentItem;
    platform: PlatformId;
  }): Promise<ContentVariation> {
    const store = await getStore();

    const { data } = await aiService.completeJSON(
      adaptedContentSchema,
      {
        system: adaptationSystemPrompt(params.platform, params.item.language),
        messages: [
          {
            role: 'user',
            content: [
              `Topic: ${params.item.topic}`,
              `Hook: ${params.item.hook}`,
              `Caption: ${params.item.caption}`,
              `CTA: ${params.item.cta}`,
              `Hashtags: ${params.item.hashtags.join(' ')}`,
            ].join('\n'),
          },
        ],
        task: 'adapt',
        maxTokens: 1500,
        context: {
          language: params.item.language,
          platform: params.platform,
          hook: params.item.hook,
          caption: params.item.caption,
          cta: params.item.cta,
          hashtags: params.item.hashtags,
        },
      },
      { workspaceId: params.workspaceId, userId: params.userId },
    );

    return store.addVariation({
      content_item_id: params.item.id,
      platform: params.platform,
      hook: data.hook,
      caption: data.caption,
      cta: data.cta,
      hashtags: normalizeHashtags(data.hashtags ?? []),
    });
  }

  async list(itemId: UUID): Promise<ContentVariation[]> {
    const store = await getStore();
    return store.listVariations(itemId);
  }
}

export const platformAdaptationService = new PlatformAdaptationService();
