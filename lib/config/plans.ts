import type { SubscriptionPlan } from '@/types';

/**
 * Pricing is data, never hard-coded inside components. Swap these values (or
 * load them from the database) without touching a single UI file.
 */
export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'একটা ব্যবসার উপর পুরো ওয়ার্কফ্লো ট্রাই করুন।',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    highlighted: false,
    features: [
      '১টা workspace',
      'AI দিয়ে business onboarding',
      'মাসে একটা ৩০-দিনের কনটেন্ট প্ল্যান',
      'মাসে ৩০টা AI generation',
      'কনটেন্ট ক্যালেন্ডার ও লাইব্রেরি',
      'অনুমোদিত কনটেন্ট ম্যানুয়ালি এক্সপোর্ট',
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
    tagline: 'প্রতিদিন পোস্ট করা বাড়ন্ত ব্র্যান্ডের জন্য।',
    price_monthly: 29,
    price_yearly: 290,
    currency: 'USD',
    highlighted: true,
    features: [
      'Free-এ যা আছে সবই',
      'আনলিমিটেড ৩০-দিনের প্ল্যান',
      'মাসে ১,০০০টা AI generation',
      'AI image generation (provider কানেক্ট থাকলে)',
      'সর্বোচ্চ ৪টা প্ল্যাটফর্ম কানেক্ট',
      'Scheduling ও auto-publishing queue',
      'অগ্রাধিকারভিত্তিক AI মডেল',
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
    tagline: 'এজেন্সি ও মাল্টি-ব্র্যান্ড টিমের জন্য।',
    price_monthly: 79,
    price_yearly: 790,
    currency: 'USD',
    highlighted: false,
    features: [
      'Pro-তে যা আছে সবই',
      'আনলিমিটেড workspace ও ব্র্যান্ড',
      'মাসে ৫,০০০টা AI generation',
      'AI video generation (provider কানেক্ট থাকলে)',
      'সবগুলো ৬টা প্ল্যাটফর্ম',
      'টিম মেম্বার ও রোল',
      'অ্যানালিটিক্স ও AI ইনসাইট',
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
