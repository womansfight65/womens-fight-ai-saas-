import { integrations } from '@/lib/config/env';
import type { ContentItem } from '@/types';

export type ImageFormat =
  | 'instagram_post'
  | 'instagram_story'
  | 'facebook_post'
  | 'carousel'
  | 'promotional'
  | 'product'
  | 'educational'
  | 'quote';

export const IMAGE_FORMATS: Array<{ id: ImageFormat; label: string; ratio: string }> = [
  { id: 'instagram_post', label: 'Instagram post', ratio: '1:1' },
  { id: 'instagram_story', label: 'Instagram story', ratio: '9:16' },
  { id: 'facebook_post', label: 'Facebook post', ratio: '4:5' },
  { id: 'carousel', label: 'Carousel slide', ratio: '4:5' },
  { id: 'promotional', label: 'Promotional creative', ratio: '1:1' },
  { id: 'product', label: 'Product creative', ratio: '1:1' },
  { id: 'educational', label: 'Educational graphic', ratio: '4:5' },
  { id: 'quote', label: 'Quote graphic', ratio: '1:1' },
];

export interface ImageRequest {
  prompt: string;
  format: ImageFormat;
  brandColors?: string[];
}

export type ImageResult =
  | { ok: true; url: string; provider: string }
  | { ok: false; error: string; provider: string };

/**
 * Image generation is provider-agnostic on purpose: the rest of the product
 * only knows about this interface, so swapping or adding a provider is a
 * single new class.
 */
export interface ImageProvider {
  readonly id: string;
  readonly label: string;
  readonly isConfigured: boolean;
  generate(request: ImageRequest): Promise<ImageResult>;
}

/** Active when no IMAGE_PROVIDER_API_KEY is set. Declines instead of faking. */
export class UnconfiguredImageProvider implements ImageProvider {
  readonly id = 'unconfigured';
  readonly label = 'Not connected';
  readonly isConfigured = false;

  async generate(): Promise<ImageResult> {
    return {
      ok: false,
      provider: this.id,
      error: 'Image generation is a future phase. No image provider is connected yet.',
    };
  }
}

export function buildImagePrompt(item: ContentItem, format: ImageFormat): string {
  return [
    item.image_concept ?? item.topic,
    `Format: ${IMAGE_FORMATS.find((f) => f.id === format)?.label ?? format}.`,
    `Mood: matches a ${item.objective} post for ${item.platform}.`,
    'No text artefacts, no watermarks, clean commercial photography or illustration.',
  ].join(' ');
}

export function getImageProvider(): ImageProvider {
  // When IMAGE_PROVIDER_API_KEY is set, return the real provider here.
  return new UnconfiguredImageProvider();
}

export const imageGenerationAvailable = integrations.imageGeneration;
