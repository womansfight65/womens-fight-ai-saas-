import 'server-only';

import { getStore } from '@/lib/data';
import { usageService } from '@/lib/usage/usage-service';
import type { ContentAsset, ContentItem, UUID } from '@/types';
import { buildImagePrompt, getImageProvider, type ImageFormat } from './image-provider';
import { getVideoProvider } from './video-provider';

/** Coordinates media generation and records every attempt against the content. */
class MediaService {
  async generateImage(params: {
    workspaceId: UUID;
    item: ContentItem;
    format: ImageFormat;
  }): Promise<ContentAsset> {
    const store = await getStore();
    const provider = getImageProvider();
    const prompt = buildImagePrompt(params.item, params.format);
    const result = await provider.generate({ prompt, format: params.format });

    if (result.ok) {
      await usageService.record({
        workspaceId: params.workspaceId,
        metric: 'image_generation',
        metadata: { format: params.format },
      });
    }

    return store.addAsset({
      content_item_id: params.item.id,
      kind: 'image',
      prompt,
      provider: provider.id,
      status: result.ok ? 'ready' : 'unavailable',
      url: result.ok ? result.url : null,
      error_message: result.ok ? null : result.error,
    });
  }

  async generateVideo(params: { workspaceId: UUID; item: ContentItem }): Promise<ContentAsset> {
    const store = await getStore();
    const provider = getVideoProvider();
    const script = params.item.video_concept ?? params.item.caption;
    const result = await provider.generate({ script, scenes: [], aspectRatio: '9:16' });

    return store.addAsset({
      content_item_id: params.item.id,
      kind: 'video',
      prompt: script,
      provider: provider.id,
      status: result.ok ? 'ready' : 'unavailable',
      url: result.ok ? result.url : null,
      error_message: result.ok ? null : result.error,
    });
  }

  async list(itemId: UUID): Promise<ContentAsset[]> {
    const store = await getStore();
    return store.listAssets(itemId);
  }
}

export const mediaService = new MediaService();
