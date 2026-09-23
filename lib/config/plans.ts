import type { SubscriptionPlan } from '@/types';

/**
 * Pricing is data, never hard-coded inside components. Swap these values (or
 * load them from the database) without touching a single UI file.
 */
export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try the whole workflow on one business.',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    highlighted: false,
    features: [
      '1 workspace',
      'AI business onboarding',
      'One 30-day content plan per month',
      '30 AI generations per month',
      'Content calendar and library',
      'Manual export of approved content',
    ],
    limits: {
      workspaces: 1,
      content_plans_per_month: 1,
      ai_generations_per_month: 30,
      image_generations_per_month: 0,
      video_generations_per_month: 0,
      connected_platforms: 1,
      scheduled_posts_per_month: 30,
      team_members: 1,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For a growing brand that posts every day.',
    price_monthly: 29,
    price_yearly: 290,
    currency: 'USD',
    highlighted: true,
    features: [
      'Everything in Free',
      'Unlimited 30-day plans',
      '1,000 AI generations per month',
      'AI image generation (when provider is connected)',
      'Up to 4 connected platforms',
      'Scheduling and auto-publishing queue',
      'Priority AI models',
    ],
    limits: {
      workspaces: 3,
      content_plans_per_month: 12,
      ai_generations_per_month: 1000,
      image_generations_per_month: 200,
      video_generations_per_month: 10,
      connected_platforms: 4,
      scheduled_posts_per_month: 500,
      team_members: 3,
    },
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For agencies and multi-brand teams.',
    price_monthly: 79,
    price_yearly: 790,
    currency: 'USD',
    highlighted: false,
    features: [
      'Everything in Pro',
      'Unlimited workspaces and brands',
      '5,000 AI generations per month',
      'AI video generation (when provider is connected)',
      'All six platforms',
      'Team members and roles',
      'Analytics and AI insights',
    ],
    limits: {
      workspaces: 999,
      content_plans_per_month: 999,
      ai_generations_per_month: 5000,
      image_generations_per_month: 2000,
      video_generations_per_month: 200,
      connected_platforms: 6,
      scheduled_posts_per_month: 5000,
      team_members: 25,
    },
  },
];

export function getPlan(id: string): SubscriptionPlan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function yearlySavingPercent(plan: SubscriptionPlan): number {
  if (!plan.price_monthly) return 0;
  const full = plan.price_monthly * 12;
  return Math.round(((full - plan.price_yearly) / full) * 100);
}
