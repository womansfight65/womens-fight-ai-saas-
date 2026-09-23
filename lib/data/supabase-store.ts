import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  AIConversation,
  AIMessage,
  AnalyticsRecord,
  BrandProfile,
  BusinessProfile,
  ContentAsset,
  ContentItem,
  ContentPlan,
  ContentStatus,
  ContentVariation,
  Notification,
  PlatformId,
  Profile,
  PublishingJob,
  ScheduledPost,
  SocialAccount,
  Subscription,
  SystemLog,
  UsageMetric,
  UsageRecord,
  UUID,
  Workspace,
  WorkspaceMember,
} from '@/types';
import { slugify } from '@/lib/utils/id';
import type { AdminStats, ContentQuery, DataStore } from './store';

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

function unwrapMaybe<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error && result.error.message && !/no rows/i.test(result.error.message)) {
    throw new Error(result.error.message);
  }
  return result.data;
}

/**
 * Production persistence. Every read and write goes through Supabase with the
 * caller's session attached, so Postgres row level security — not application
 * code — is what actually enforces workspace isolation.
 */
export class SupabaseStore implements DataStore {
  readonly kind = 'supabase' as const;

  constructor(private readonly db: SupabaseClient) {}

  /* Profiles -------------------------------------------------------- */

  async getProfile(id: UUID) {
    return unwrapMaybe<Profile>(
      await this.db.from('profiles').select('*').eq('id', id).maybeSingle(),
    );
  }

  async getProfileByEmail(email: string) {
    return unwrapMaybe<Profile>(
      await this.db.from('profiles').select('*').ilike('email', email).maybeSingle(),
    );
  }

  async createProfile(input: Partial<Profile> & { id: UUID; email: string }) {
    return unwrap<Profile>(
      await this.db
        .from('profiles')
        .insert({
          id: input.id,
          email: input.email,
          full_name: input.full_name ?? null,
          role: input.role ?? 'user',
          locale: input.locale ?? 'en',
          onboarding_completed: input.onboarding_completed ?? false,
        })
        .select('*')
        .single(),
    );
  }

  async updateProfile(id: UUID, patch: Partial<Profile>) {
    return unwrapMaybe<Profile>(
      await this.db.from('profiles').update(patch).eq('id', id).select('*').maybeSingle(),
    );
  }

  async listProfiles(limit = 200) {
    return (
      unwrapMaybe<Profile[]>(
        await this.db
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit),
      ) ?? []
    );
  }

  async countProfiles() {
    const { count } = await this.db.from('profiles').select('*', { count: 'exact', head: true });
    return count ?? 0;
  }

  /* Workspaces ------------------------------------------------------ */

  async createWorkspace(input: { owner_id: UUID; name: string; timezone?: string }) {
    return unwrap<Workspace>(
      await this.db
        .from('workspaces')
        .insert({
          owner_id: input.owner_id,
          name: input.name,
          slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`,
          timezone: input.timezone ?? 'Asia/Dhaka',
        })
        .select('*')
        .single(),
    );
  }

  async getWorkspace(id: UUID) {
    return unwrapMaybe<Workspace>(
      await this.db.from('workspaces').select('*').eq('id', id).maybeSingle(),
    );
  }

  async listWorkspacesForUser(userId: UUID) {
    return (
      unwrapMaybe<Workspace[]>(
        await this.db
          .from('workspaces')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: true }),
      ) ?? []
    );
  }

  async listWorkspaces(limit = 200) {
    return (
      unwrapMaybe<Workspace[]>(
        await this.db
          .from('workspaces')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit),
      ) ?? []
    );
  }

  async updateWorkspace(id: UUID, patch: Partial<Workspace>) {
    return unwrapMaybe<Workspace>(
      await this.db.from('workspaces').update(patch).eq('id', id).select('*').maybeSingle(),
    );
  }

  async addWorkspaceMember(input: Omit<WorkspaceMember, 'id' | 'created_at'>) {
    return unwrap<WorkspaceMember>(
      await this.db.from('workspace_members').insert(input).select('*').single(),
    );
  }

  async listWorkspaceMembers(workspaceId: UUID) {
    return (
      unwrapMaybe<WorkspaceMember[]>(
        await this.db.from('workspace_members').select('*').eq('workspace_id', workspaceId),
      ) ?? []
    );
  }

  /* Business Brain -------------------------------------------------- */

  async getBusinessProfile(workspaceId: UUID) {
    return unwrapMaybe<BusinessProfile>(
      await this.db
        .from('business_profiles')
        .select('*')
        .eq('workspace_id', workspaceId)
        .maybeSingle(),
    );
  }

  async upsertBusinessProfile(workspaceId: UUID, patch: Partial<BusinessProfile>) {
    return unwrap<BusinessProfile>(
      await this.db
        .from('business_profiles')
        .upsert({ ...patch, workspace_id: workspaceId }, { onConflict: 'workspace_id' })
        .select('*')
        .single(),
    );
  }

  async getBrandProfile(workspaceId: UUID) {
    return unwrapMaybe<BrandProfile>(
      await this.db.from('brand_profiles').select('*').eq('workspace_id', workspaceId).maybeSingle(),
    );
  }

  async upsertBrandProfile(workspaceId: UUID, patch: Partial<BrandProfile>) {
    return unwrap<BrandProfile>(
      await this.db
        .from('brand_profiles')
        .upsert({ ...patch, workspace_id: workspaceId }, { onConflict: 'workspace_id' })
        .select('*')
        .single(),
    );
  }

  /* Conversations --------------------------------------------------- */

  async createConversation(input: Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>) {
    return unwrap<AIConversation>(
      await this.db.from('ai_conversations').insert(input).select('*').single(),
    );
  }

  async getConversation(id: UUID) {
    return unwrapMaybe<AIConversation>(
      await this.db.from('ai_conversations').select('*').eq('id', id).maybeSingle(),
    );
  }

  async findConversation(workspaceId: UUID, purpose: AIConversation['purpose']) {
    return unwrapMaybe<AIConversation>(
      await this.db
        .from('ai_conversations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('purpose', purpose)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
  }

  async addMessage(input: Omit<AIMessage, 'id' | 'created_at'>) {
    return unwrap<AIMessage>(await this.db.from('ai_messages').insert(input).select('*').single());
  }

  async listMessages(conversationId: UUID) {
    return (
      unwrapMaybe<AIMessage[]>(
        await this.db
          .from('ai_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true }),
      ) ?? []
    );
  }

  /* Plans & content ------------------------------------------------- */

  async createPlan(input: Omit<ContentPlan, 'id' | 'created_at' | 'updated_at'>) {
    return unwrap<ContentPlan>(await this.db.from('content_plans').insert(input).select('*').single());
  }

  async updatePlan(id: UUID, patch: Partial<ContentPlan>) {
    return unwrapMaybe<ContentPlan>(
      await this.db.from('content_plans').update(patch).eq('id', id).select('*').maybeSingle(),
    );
  }

  async getPlan(id: UUID) {
    return unwrapMaybe<ContentPlan>(
      await this.db.from('content_plans').select('*').eq('id', id).maybeSingle(),
    );
  }

  async listPlans(workspaceId: UUID) {
    return (
      unwrapMaybe<ContentPlan[]>(
        await this.db
          .from('content_plans')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false }),
      ) ?? []
    );
  }

  async getLatestPlan(workspaceId: UUID) {
    return unwrapMaybe<ContentPlan>(
      await this.db
        .from('content_plans')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
  }

  async createContentItems(items: Array<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>) {
    if (!items.length) return [];
    return unwrap<ContentItem[]>(await this.db.from('content_items').insert(items).select('*'));
  }

  async getContentItem(id: UUID) {
    return unwrapMaybe<ContentItem>(
      await this.db.from('content_items').select('*').eq('id', id).maybeSingle(),
    );
  }

  async updateContentItem(id: UUID, patch: Partial<ContentItem>) {
    return unwrapMaybe<ContentItem>(
      await this.db.from('content_items').update(patch).eq('id', id).select('*').maybeSingle(),
    );
  }

  async deleteContentItem(id: UUID) {
    const { error } = await this.db.from('content_items').delete().eq('id', id);
    return !error;
  }

  async listContentItems(workspaceId: UUID, query: ContentQuery = {}) {
    let builder = this.db.from('content_items').select('*').eq('workspace_id', workspaceId);
    if (query.status && query.status !== 'all') builder = builder.eq('status', query.status);
    if (query.platform && query.platform !== 'all') builder = builder.eq('platform', query.platform);
    if (query.planId) builder = builder.eq('plan_id', query.planId);
    if (query.from) builder = builder.gte('scheduled_date', query.from);
    if (query.to) builder = builder.lte('scheduled_date', query.to);
    if (query.search) builder = builder.or(`topic.ilike.%${query.search}%,caption.ilike.%${query.search}%`);
    builder = builder
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });
    if (query.limit) builder = builder.range(query.offset ?? 0, (query.offset ?? 0) + query.limit - 1);
    return unwrapMaybe<ContentItem[]>(await builder) ?? [];
  }

  async countContentByStatus(workspaceId: UUID) {
    const rows = unwrapMaybe<Array<{ status: ContentStatus }>>(
      await this.db.from('content_items').select('status').eq('workspace_id', workspaceId),
    );
    const base: Record<ContentStatus, number> = {
      draft: 0,
      generated: 0,
      approved: 0,
      scheduled: 0,
      published: 0,
      failed: 0,
    };
    for (const row of rows ?? []) base[row.status] += 1;
    return base;
  }

  async countAllContent() {
    const { count } = await this.db.from('content_items').select('*', { count: 'exact', head: true });
    return count ?? 0;
  }

  async addVariation(input: Omit<ContentVariation, 'id' | 'created_at'>) {
    return unwrap<ContentVariation>(
      await this.db.from('content_variations').insert(input).select('*').single(),
    );
  }

  async listVariations(contentItemId: UUID) {
    return (
      unwrapMaybe<ContentVariation[]>(
        await this.db.from('content_variations').select('*').eq('content_item_id', contentItemId),
      ) ?? []
    );
  }

  async addAsset(input: Omit<ContentAsset, 'id' | 'created_at'>) {
    return unwrap<ContentAsset>(await this.db.from('content_assets').insert(input).select('*').single());
  }

  async listAssets(contentItemId: UUID) {
    return (
      unwrapMaybe<ContentAsset[]>(
        await this.db.from('content_assets').select('*').eq('content_item_id', contentItemId),
      ) ?? []
    );
  }

  /* Social ---------------------------------------------------------- */

  async listSocialAccounts(workspaceId: UUID) {
    return (
      unwrapMaybe<SocialAccount[]>(
        await this.db.from('social_accounts').select('*').eq('workspace_id', workspaceId),
      ) ?? []
    );
  }

  async upsertSocialAccount(workspaceId: UUID, platform: PlatformId, patch: Partial<SocialAccount>) {
    return unwrap<SocialAccount>(
      await this.db
        .from('social_accounts')
        .upsert(
          { ...patch, workspace_id: workspaceId, platform },
          { onConflict: 'workspace_id,platform' },
        )
        .select('*')
        .single(),
    );
  }

  /* Scheduling & publishing ----------------------------------------- */

  async createScheduledPost(input: Omit<ScheduledPost, 'id' | 'created_at'>) {
    return unwrap<ScheduledPost>(
      await this.db.from('scheduled_posts').insert(input).select('*').single(),
    );
  }

  async updateScheduledPost(id: UUID, patch: Partial<ScheduledPost>) {
    return unwrapMaybe<ScheduledPost>(
      await this.db.from('scheduled_posts').update(patch).eq('id', id).select('*').maybeSingle(),
    );
  }

  async listScheduledPosts(workspaceId: UUID) {
    return (
      unwrapMaybe<ScheduledPost[]>(
        await this.db
          .from('scheduled_posts')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('scheduled_at', { ascending: true }),
      ) ?? []
    );
  }

  async findScheduledPostByContent(contentItemId: UUID) {
    return unwrapMaybe<ScheduledPost>(
      await this.db
        .from('scheduled_posts')
        .select('*')
        .eq('content_item_id', contentItemId)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
  }

  async createPublishingJob(input: Omit<PublishingJob, 'id' | 'created_at' | 'updated_at'>) {
    return unwrap<PublishingJob>(
      await this.db.from('publishing_jobs').insert(input).select('*').single(),
    );
  }

  async updatePublishingJob(id: UUID, patch: Partial<PublishingJob>) {
    return unwrapMaybe<PublishingJob>(
      await this.db.from('publishing_jobs').update(patch).eq('id', id).select('*').maybeSingle(),
    );
  }

  async listPublishingJobs(workspaceId?: UUID, limit = 100) {
    let builder = this.db.from('publishing_jobs').select('*');
    if (workspaceId) builder = builder.eq('workspace_id', workspaceId);
    return (
      unwrapMaybe<PublishingJob[]>(
        await builder.order('created_at', { ascending: false }).limit(limit),
      ) ?? []
    );
  }

  async listDuePublishingJobs(nowISO: string, limit = 25) {
    return (
      unwrapMaybe<PublishingJob[]>(
        await this.db
          .from('publishing_jobs')
          .select('*')
          .in('status', ['queued', 'retrying'])
          .lte('run_after', nowISO)
          .order('run_after', { ascending: true })
          .limit(limit),
      ) ?? []
    );
  }

  /* Analytics ------------------------------------------------------- */

  async listAnalytics(workspaceId: UUID) {
    return (
      unwrapMaybe<AnalyticsRecord[]>(
        await this.db.from('analytics').select('*').eq('workspace_id', workspaceId),
      ) ?? []
    );
  }

  /* Billing & usage ------------------------------------------------- */

  async getSubscription(workspaceId: UUID) {
    return unwrapMaybe<Subscription>(
      await this.db.from('subscriptions').select('*').eq('workspace_id', workspaceId).maybeSingle(),
    );
  }

  async upsertSubscription(workspaceId: UUID, patch: Partial<Subscription>) {
    return unwrap<Subscription>(
      await this.db
        .from('subscriptions')
        .upsert({ ...patch, workspace_id: workspaceId }, { onConflict: 'workspace_id' })
        .select('*')
        .single(),
    );
  }

  async listSubscriptions(limit = 200) {
    return (
      unwrapMaybe<Subscription[]>(await this.db.from('subscriptions').select('*').limit(limit)) ?? []
    );
  }

  async addUsage(input: Omit<UsageRecord, 'id' | 'created_at'>) {
    return unwrap<UsageRecord>(await this.db.from('usage_records').insert(input).select('*').single());
  }

  async listUsage(workspaceId: UUID, period?: string) {
    let builder = this.db.from('usage_records').select('*').eq('workspace_id', workspaceId);
    if (period) builder = builder.eq('period', period);
    return unwrapMaybe<UsageRecord[]>(await builder) ?? [];
  }

  async listAllUsage(period?: string, limit = 500) {
    let builder = this.db.from('usage_records').select('*');
    if (period) builder = builder.eq('period', period);
    return (
      unwrapMaybe<UsageRecord[]>(
        await builder.order('created_at', { ascending: false }).limit(limit),
      ) ?? []
    );
  }

  async sumUsage(workspaceId: UUID, metric: UsageMetric, period: string) {
    const rows = unwrapMaybe<Array<{ quantity: number }>>(
      await this.db
        .from('usage_records')
        .select('quantity')
        .eq('workspace_id', workspaceId)
        .eq('metric', metric)
        .eq('period', period),
    );
    return (rows ?? []).reduce((total, row) => total + row.quantity, 0);
  }

  /* Notifications & logs -------------------------------------------- */

  async addNotification(input: Omit<Notification, 'id' | 'created_at'>) {
    return unwrap<Notification>(await this.db.from('notifications').insert(input).select('*').single());
  }

  async listNotifications(userId: UUID, limit = 30) {
    return (
      unwrapMaybe<Notification[]>(
        await this.db
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
      ) ?? []
    );
  }

  async markNotificationsRead(userId: UUID) {
    await this.db
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
  }

  async addLog(input: Omit<SystemLog, 'id' | 'created_at'>) {
    return unwrap<SystemLog>(await this.db.from('system_logs').insert(input).select('*').single());
  }

  async listLogs(limit = 200) {
    return (
      unwrapMaybe<SystemLog[]>(
        await this.db
          .from('system_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit),
      ) ?? []
    );
  }

  /* Admin ----------------------------------------------------------- */

  async adminStats(): Promise<AdminStats> {
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const [users, workspaces, content, subs, jobs, usage, active] = await Promise.all([
      this.db.from('profiles').select('*', { count: 'exact', head: true }),
      this.db.from('workspaces').select('*', { count: 'exact', head: true }),
      this.db.from('content_items').select('status'),
      this.db.from('subscriptions').select('plan_id'),
      this.db.from('publishing_jobs').select('status'),
      this.db.from('usage_records').select('quantity,metric'),
      this.db.from('ai_conversations').select('user_id').gte('updated_at', weekAgo),
    ]);

    const statusCounts = ((content.data ?? []) as Array<{ status: ContentStatus }>).reduce<
      Record<string, number>
    >((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {});

    const subscriptionsByPlan = ((subs.data ?? []) as Array<{ plan_id: string }>).reduce<
      Record<string, number>
    >((acc, row) => {
      acc[row.plan_id] = (acc[row.plan_id] ?? 0) + 1;
      return acc;
    }, {});

    return {
      users: users.count ?? 0,
      workspaces: workspaces.count ?? 0,
      activeUsers7d: new Set(((active.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id))
        .size,
      contentItems: (content.data ?? []).length,
      approved: statusCounts.approved ?? 0,
      scheduled: statusCounts.scheduled ?? 0,
      published: statusCounts.published ?? 0,
      failedJobs: ((jobs.data ?? []) as Array<{ status: string }>).filter((j) => j.status === 'failed')
        .length,
      aiRequests: ((usage.data ?? []) as Array<{ quantity: number; metric: string }>)
        .filter((u) => u.metric === 'ai_request')
        .reduce((total, u) => total + u.quantity, 0),
      subscriptionsByPlan,
    };
  }
}
