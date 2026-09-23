import { z } from 'zod';

export const platformEnum = z.enum(['facebook', 'instagram', 'youtube', 'tiktok', 'x', 'linkedin']);

export const contentTypeEnum = z.enum([
  'image_post',
  'carousel',
  'reel',
  'short_video',
  'story',
  'text_post',
  'live',
  'poll',
]);

export const objectiveEnum = z.enum([
  'awareness',
  'education',
  'engagement',
  'trust',
  'storytelling',
  'promotion',
  'conversion',
  'community',
]);

export const languageEnum = z.enum(['en', 'bn', 'banglish']);

/** What the onboarding assistant returns after every user turn. */
export const onboardingTurnSchema = z.object({
  reply: z.string().min(1),
  business: z
    .object({
      business_name: z.string().nullish(),
      industry: z.string().nullish(),
      description: z.string().nullish(),
      products: z.array(z.string()).nullish(),
      services: z.array(z.string()).nullish(),
      location: z.string().nullish(),
      target_audience: z.string().nullish(),
      audience_problems: z.array(z.string()).nullish(),
      audience_needs: z.array(z.string()).nullish(),
      audience_interests: z.array(z.string()).nullish(),
      business_goals: z.array(z.string()).nullish(),
      content_goals: z.array(z.string()).nullish(),
      preferred_platforms: z.array(platformEnum).nullish(),
      posting_frequency: z.string().nullish(),
    })
    .partial()
    .default({}),
  brand: z
    .object({
      brand_voice: z.string().nullish(),
      personality: z.array(z.string()).nullish(),
      style_notes: z.string().nullish(),
      preferred_language: languageEnum.nullish(),
    })
    .partial()
    .default({}),
  /** True once the assistant believes it can build a Business Brain. */
  ready: z.boolean().default(false),
  missing: z.array(z.string()).default([]),
});

export type OnboardingTurn = z.infer<typeof onboardingTurnSchema>;

export const plannedDaySchema = z.object({
  day: z.number().int().min(1),
  topic: z.string().min(1),
  content_type: contentTypeEnum,
  platform: platformEnum,
  objective: objectiveEnum,
  hook: z.string().min(1),
  caption: z.string().min(1),
  cta: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  image_concept: z.string().nullish(),
  video_concept: z.string().nullish(),
  suggested_time: z.string().default('18:00'),
});

export const contentPlanSchema = z.object({
  strategy_summary: z.string().min(1),
  days: z.array(plannedDaySchema).min(1),
});

export type PlannedDay = z.infer<typeof plannedDaySchema>;
export type GeneratedPlan = z.infer<typeof contentPlanSchema>;

export const generatedContentSchema = z.object({
  topic: z.string().min(1),
  content_type: contentTypeEnum,
  platform: platformEnum,
  objective: objectiveEnum,
  hook: z.string().min(1),
  caption: z.string().min(1),
  cta: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  image_concept: z.string().nullish(),
  video_concept: z.string().nullish(),
  suggested_time: z.string().default('18:00'),
  note: z.string().nullish(),
});

export type GeneratedContent = z.infer<typeof generatedContentSchema>;

export const adaptedContentSchema = z.object({
  platform: platformEnum,
  hook: z.string().min(1),
  caption: z.string().min(1),
  cta: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});

export type AdaptedContent = z.infer<typeof adaptedContentSchema>;
