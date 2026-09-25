/**
 * WF Autopost AI — shared domain types.
 * These mirror the Postgres schema in `supabase/schema.sql`.
 */

export type UUID = string;
export type ISODate = string;

/* ------------------------------------------------------------------ */
/* Identity & workspaces                                               */
/* ------------------------------------------------------------------ */

export type AppRole = 'user' | 'admin';

export interface Profile {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  locale: SupportedLanguage;
  onboarding_completed: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Workspace {
  id: UUID;
  owner_id: UUID;
  name: string;
  slug: string;
  timezone: string;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface WorkspaceMember {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  role: WorkspaceRole;
  created_at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Business Brain                                                      */
/* ------------------------------------------------------------------ */

export interface BusinessProfile {
  id: UUID;
  workspace_id: UUID;
  business_name: string | null;
  industry: string | null;
  description: string | null;
  products: string[];
  services: string[];
  location: string | null;
  target_audience: string | null;
  audience_problems: string[];
  audience_needs: string[];
  audience_interests: string[];
  business_goals: string[];
  content_goals: string[];
  preferred_platforms: PlatformId[];
  posting_frequency: string | null;
  completeness: number; // 0..100
  created_at: ISODate;
  updated_at: ISODate;
}

export interface BrandProfile {
  id: UUID;
  workspace_id: UUID;
  brand_voice: string | null;
  personality: string[];
  style_notes: string | null;
  preferred_language: SupportedLanguage;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/** The composed object every AI call receives. */
export interface BusinessBrain {
  business: BusinessProfile | null;
  brand: BrandProfile | null;
  history: {
    recent_topics: string[];
    edited_examples: string[];
    feedback_notes: string[];
  };
}

/* ------------------------------------------------------------------ */
/* Language engine                                                     */
/* ------------------------------------------------------------------ */

export type SupportedLanguage = 'en' | 'bn' | 'banglish';

export interface LanguageDetection {
  language: SupportedLanguage;
  confidence: number;
  mixed: boolean;
}

/* ------------------------------------------------------------------ */
/* AI conversations                                                    */
/* ------------------------------------------------------------------ */

export type ConversationPurpose = 'onboarding' | 'create' | 'assistant';

export interface AIConversation {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  purpose: ConversationPurpose;
  title: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  id: UUID;
  conversation_id: UUID;
  role: ChatRole;
  content: string;
  language: SupportedLanguage | null;
  created_at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export type PlatformId =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'x'
  | 'linkedin';

export type ContentType =
  | 'image_post'
  | 'carousel'
  | 'reel'
  | 'short_video'
  | 'story'
  | 'text_post'
  | 'live'
  | 'poll';

export type ContentObjective =
  | 'awareness'
  | 'education'
  | 'engagement'
  | 'trust'
  | 'storytelling'
  | 'promotion'
  | 'conversion'
  | 'community';

export type ContentStatus =
  | 'draft'
  | 'generated'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed';

export type PlanStatus = 'generating' | 'ready' | 'archived' | 'failed';

export interface ContentPlan {
  id: UUID;
  workspace_id: UUID;
  title: string;
  start_date: string; // yyyy-mm-dd
  days: number;
  status: PlanStatus;
  strategy_summary: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface ContentItem {
  id: UUID;
  workspace_id: UUID;
  plan_id: UUID | null;
  day_number: number | null;
  scheduled_date: string; // yyyy-mm-dd
  scheduled_time: string; // HH:mm
  topic: string;
  content_type: ContentType;
  platform: PlatformId;
  objective: ContentObjective;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  image_concept: string | null;
  video_concept: string | null;
  language: SupportedLanguage;
  status: ContentStatus;
  approved_at: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/** A platform-adapted variant of a content item. */
export interface ContentVariation {
  id: UUID;
  content_item_id: UUID;
  platform: PlatformId;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  created_at: ISODate;
}

export type AssetKind = 'image' | 'video';
export type AssetStatus = 'pending' | 'generating' | 'ready' | 'failed' | 'unavailable';

export interface ContentAsset {
  id: UUID;
  content_item_id: UUID;
  kind: AssetKind;
  prompt: string;
  provider: string;
  status: AssetStatus;
  url: string | null;
  error_message: string | null;
  created_at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Social accounts, scheduling & publishing                            */
/* ------------------------------------------------------------------ */

export type SocialConnectionStatus =
  | 'not_connected'
  | 'coming_soon'
  | 'connected'
  | 'expired'
  | 'error';

export interface SocialAccount {
  id: UUID;
  workspace_id: UUID;
  platform: PlatformId;
  external_account_id: string | null;
  display_name: string | null;
  status: SocialConnectionStatus;
  connected_at: ISODate | null;
  created_at: ISODate;
  /** Server-only. Never sent to the browser — read only by providers and background jobs. */
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: ISODate | null;
}

export type ScheduledPostStatus =
  | 'scheduled'
  | 'queued'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled';

export interface ScheduledPost {
  id: UUID;
  workspace_id: UUID;
  content_item_id: UUID;
  social_account_id: UUID | null;
  scheduled_at: ISODate;
  timezone: string;
  status: ScheduledPostStatus;
  attempt_count: number;
  error_message: string | null;
  published_at: ISODate | null;
  external_post_id: string | null;
  created_at: ISODate;
}

export type PublishingJobStatus =
  | 'queued'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'retrying'
  | 'blocked';

export interface PublishingJob {
  id: UUID;
  workspace_id: UUID;
  scheduled_post_id: UUID;
  platform: PlatformId;
  status: PublishingJobStatus;
  attempt_count: number;
  last_error: string | null;
  run_after: ISODate;
  created_at: ISODate;
  updated_at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export interface AnalyticsRecord {
  id: UUID;
  workspace_id: UUID;
  content_item_id: UUID | null;
  platform: PlatformId;
  captured_at: ISODate;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  follower_delta: number;
}

/* ------------------------------------------------------------------ */
/* Billing & usage                                                     */
/* ------------------------------------------------------------------ */

export type PlanTier = 'free' | 'pro' | 'business';
export type BillingInterval = 'monthly' | 'yearly';

export interface PlanLimits {
  workspaces: number;
  content_plans_per_month: number;
  ai_generations_per_month: number;
  image_generations_per_month: number;
  video_generations_per_month: number;
  connected_platforms: number;
  scheduled_posts_per_month: number;
  team_members: number;
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  highlighted: boolean;
  features: string[];
  limits: PlanLimits;
}

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'cancelled'
  | 'not_configured';

export interface Subscription {
  id: UUID;
  workspace_id: UUID;
  plan_id: PlanTier;
  interval: BillingInterval;
  status: SubscriptionStatus;
  current_period_end: ISODate | null;
  cancel_at_period_end: boolean;
  created_at: ISODate;
}

export type UsageMetric =
  | 'ai_request'
  | 'text_generation'
  | 'image_generation'
  | 'video_generation'
  | 'content_generation'
  | 'publishing_job';

export interface UsageRecord {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID | null;
  metric: UsageMetric;
  quantity: number;
  period: string; // yyyy-mm
  metadata: Record<string, unknown>;
  created_at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Notifications & logs                                                */
/* ------------------------------------------------------------------ */

export type NotificationKind =
  | 'welcome'
  | 'business_profile_ready'
  | 'plan_ready'
  | 'content_generated'
  | 'content_approved'
  | 'content_scheduled'
  | 'content_published'
  | 'publishing_failed'
  | 'retry_successful'
  | 'subscription_warning'
  | 'usage_warning';

export interface Notification {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  kind: NotificationKind;
  title: string;
  body: string | null;
  href: string | null;
  read_at: ISODate | null;
  created_at: ISODate;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SystemLog {
  id: UUID;
  level: LogLevel;
  scope: string;
  message: string;
  workspace_id: UUID | null;
  metadata: Record<string, unknown>;
  created_at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Service result helpers                                              */
/* ------------------------------------------------------------------ */

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export interface SessionUser {
  id: UUID;
  email: string;
  full_name: string | null;
  role: AppRole;
  workspace_id: UUID;
  onboarding_completed: boolean;
}
