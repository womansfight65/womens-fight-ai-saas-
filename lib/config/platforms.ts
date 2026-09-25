import type { ContentType, PlatformId } from '@/types';

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  /** Short description of the platform's content style. */
  style: string;
  captionLimit: number;
  hashtagSweetSpot: [number, number];
  contentTypes: ContentType[];
  accent: string;
  /** Whether a real publishing integration is wired up in this build. */
  integrationReady: boolean;
}

export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    style: 'Detailed and conversational. Room for story, context and a clear ask.',
    captionLimit: 2200,
    hashtagSweetSpot: [2, 5],
    contentTypes: ['image_post', 'carousel', 'text_post', 'reel', 'live'],
    accent: '#1877F2',
    integrationReady: true,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    style: 'Visual first. Tight caption, strong first line, generous hashtags.',
    captionLimit: 2200,
    hashtagSweetSpot: [8, 15],
    contentTypes: ['image_post', 'carousel', 'reel', 'story'],
    accent: '#E1306C',
    integrationReady: false,
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    style: 'Searchable title plus a described video concept and chapters.',
    captionLimit: 5000,
    hashtagSweetSpot: [3, 6],
    contentTypes: ['short_video', 'reel'],
    accent: '#FF0000',
    integrationReady: false,
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    style: 'Hook in the first two seconds. Short caption, trend aware.',
    captionLimit: 2200,
    hashtagSweetSpot: [3, 6],
    contentTypes: ['short_video', 'reel'],
    accent: '#010101',
    integrationReady: false,
  },
  x: {
    id: 'x',
    name: 'X',
    style: 'Short and concise. One idea per post.',
    captionLimit: 280,
    hashtagSweetSpot: [1, 2],
    contentTypes: ['text_post', 'image_post'],
    accent: '#0F172A',
    integrationReady: false,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    style: 'Professional and insight-led. Business outcomes over hype.',
    captionLimit: 3000,
    hashtagSweetSpot: [3, 5],
    contentTypes: ['text_post', 'image_post', 'carousel'],
    accent: '#0A66C2',
    integrationReady: false,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  image_post: 'Image post',
  carousel: 'Carousel',
  reel: 'Reel',
  short_video: 'Short video',
  story: 'Story',
  text_post: 'Text post',
  live: 'Live',
  poll: 'Poll',
};

export const OBJECTIVE_LABELS = {
  awareness: 'Awareness',
  education: 'Education',
  engagement: 'Engagement',
  trust: 'Trust',
  storytelling: 'Storytelling',
  promotion: 'Promotion',
  conversion: 'Conversion',
  community: 'Community',
} as const;

export const STATUS_LABELS = {
  draft: 'Draft',
  generated: 'Generated',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
} as const;
