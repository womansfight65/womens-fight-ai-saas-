import fs from 'fs';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

import { uuid, slugify } from '@/lib/utils/id';
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
import type { AdminStats, ContentQuery, DataStore } from './store';

interface Credentials {
  email: string;
  user_id: UUID;
  hash: string;
  salt: string;
}

interface ResetToken {
  token: string;
  user_id: UUID;
  expires_at: string;
}

interface DevDatabase {
  profiles: Profile[];
  credentials: Credentials[];
  reset_tokens: ResetToken[];
  workspaces: Workspace[];
  workspace_members: WorkspaceMember[];
  business_profiles: BusinessProfile[];
  brand_profiles: BrandProfile[];
  ai_conversations: AIConversation[];
  ai_messages: AIMessage[];
  content_plans: ContentPlan[];
  content_items: ContentItem[];
  content_variations: ContentVariation[];
  content_assets: ContentAsset[];
  social_accounts: SocialAccount[];
  scheduled_posts: ScheduledPost[];
  publishing_jobs: PublishingJob[];
  analytics: AnalyticsRecord[];
  subscriptions: Subscription[];
  usage_records: UsageRecord[];
  notifications: Notification[];
  system_logs: SystemLog[];
}

const EMPTY: DevDatabase = {
  profiles: [],
  credentials: [],
  reset_tokens: [],
  workspaces: [],
  workspace_members: [],
  business_profiles: [],
  brand_profiles: [],
  ai_conversations: [],
  ai_messages: [],
  content_plans: [],
  content_items: [],
  content_variations: [],
  content_assets: [],
  social_accounts: [],
  scheduled_posts: [],
  publishing_jobs: [],
  analytics: [],
  subscriptions: [],
  usage_records: [],
  notifications: [],
  system_logs: [],
};

const DATA_DIR = path.join(process.cwd(), '.dev-data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

type Cache = { db: DevDatabase; dirty: boolean };
const globalCache = globalThis as unknown as { __wfDevStore?: Cache };

function load(): DevDatabase {
  if (globalCache.__wfDevStore) return globalCache.__wfDevStore.db;
  let db: DevDatabase = structuredClone(EMPTY);
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Partial<DevDatabase>;
      db = { ...structuredClone(EMPTY), ...parsed };
    }
  } catch {
    // A corrupt development file should never take the app down.
    db = structuredClone(EMPTY);
  }
  globalCache.__wfDevStore = { db, dirty: false };
  return db;
}

function persist(): void {
  const cache = globalCache.__wfDevStore;
  if (!cache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(cache.db, null, 2), 'utf8');
  } catch {
    // Read-only filesystem: keep working in memory for this process.
  }
}

function now(): string {
  return new Date().toISOString();
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, salt: string, expected: string): boolean {
  const actual = scryptSync(password, salt, 64);
  const want = Buffer.from(expected, 'hex');
  if (actual.length !== want.length) return false;
  return timingSafeEqual(actual, want);
}

function matchesSearch(item: ContentItem, term: string): boolean {
  const haystack = `${item.topic} ${item.hook} ${item.caption} ${item.cta} ${item.hashtags.join(' ')}`;
  return haystack.toLowerCase().includes(term.toLowerCase());
}

/**
 * Local development store. Used only when Supabase credentials are absent, so
 * the whole product can be explored end to end on a laptop. It is a real
 * persistence layer (JSON on disk, salted password hashes) — not mock data
 * pretending to be a database — but it is single-node and not for production.
 */
export class DevStore implements DataStore {
  readonly kind = 'development' as const;

  private db(): DevDatabase {
    return load();
  }

  private save(): void {
    persist();
  }

  /* ---------------------------------------------------------------- */
  /* Profiles                                                          */
  /* ---------------------------------------------------------------- */

  async getProfile(id: UUID) {
    return this.db().profiles.find((p) => p.id === id) ?? null;
  }

  async getProfileByEmail(email: string) {
    const target = email.trim().toLowerCase();
    return this.db().profiles.find((p) => p.email.toLowerCase() === target) ?? null;
  }

  async createProfile(input: Partial<Profile> & { id: UUID; email: string }) {
    const profile: Profile = {
      id: input.id,
      email: input.email,
      full_name: input.full_name ?? null,
      avatar_url: input.avatar_url ?? null,
      role: input.role ?? 'user',
      locale: input.locale ?? 'en',
      onboarding_completed: input.onboarding_completed ?? false,
      created_at: now(),
      updated_at: now(),
    };
    this.db().profiles.push(profile);
    this.save();
    return profile;
  }

  async updateProfile(id: UUID, patch: Partial<Profile>) {
    const profile = this.db().profiles.find((p) => p.id === id);
    if (!profile) return null;
    Object.assign(profile, patch, { updated_at: now() });
    this.save();
    return profile;
  }

  async listProfiles(limit = 200) {
    return [...this.db().profiles]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  async countProfiles() {
    return this.db().profiles.length;
  }

  /* ---------------------------------------------------------------- */
  /* Workspaces                                                        */
  /* ---------------------------------------------------------------- */

  async createWorkspace(input: { owner_id: UUID; name: string; timezone?: string }) {
    const workspace: Workspace = {
      id: uuid(),
      owner_id: input.owner_id,
      name: input.name,
      slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`,
      timezone: input.timezone ?? 'Asia/Dhaka',
      created_at: now(),
      updated_at: now(),
    };
    this.db().workspaces.push(workspace);
    this.save();
    return workspace;
  }

  async getWorkspace(id: UUID) {
    return this.db().workspaces.find((w) => w.id === id) ?? null;
  }

  async listWorkspacesForUser(userId: UUID) {
    const ids = new Set(
      this.db()
        .workspace_members.filter((m) => m.user_id === userId)
        .map((m) => m.workspace_id),
    );
    return this.db().workspaces.filter((w) => w.owner_id === userId || ids.has(w.id));
  }

  async listWorkspaces(limit = 200) {
    return [...this.db().workspaces]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  async updateWorkspace(id: UUID, patch: Partial<Workspace>) {
    const workspace = this.db().workspaces.find((w) => w.id === id);
    if (!workspace) return null;
    Object.assign(workspace, patch, { updated_at: now() });
    this.save();
    return workspace;
  }

  async addWorkspaceMember(input: Omit<WorkspaceMember, 'id' | 'created_at'>) {
    const member: WorkspaceMember = { ...input, id: uuid(), created_at: now() };
    this.db().workspace_members.push(member);
    this.save();
    return member;
  }

  async listWorkspaceMembers(workspaceId: UUID) {
    return this.db().workspace_members.filter((m) => m.workspace_id === workspaceId);
  }

  /* ---------------------------------------------------------------- */
  /* Business Brain                                                    */
  /* ---------------------------------------------------------------- */

  async getBusinessProfile(workspaceId: UUID) {
    return this.db().business_profiles.find((b) => b.workspace_id === workspaceId) ?? null;
  }

  async upsertBusinessProfile(workspaceId: UUID, patch: Partial<BusinessProfile>) {
    const existing = this.db().business_profiles.find((b) => b.workspace_id === workspaceId);
    if (existing) {
      Object.assign(existing, patch, { updated_at: now() });
      this.save();
      return existing;
    }
    const created: BusinessProfile = {
      id: uuid(),
      workspace_id: workspaceId,
      business_name: null,
      industry: null,
      description: null,
      products: [],
      services: [],
      location: null,
      target_audience: null,
      audience_problems: [],
      audience_needs: [],
      audience_interests: [],
      business_goals: [],
      content_goals: [],
      preferred_platforms: [],
      posting_frequency: null,
      completeness: 0,
      created_at: now(),
      updated_at: now(),
      ...patch,
    };
    this.db().business_profiles.push(created);
    this.save();
    return created;
  }

  async getBrandProfile(workspaceId: UUID) {
    return this.db().brand_profiles.find((b) => b.workspace_id === workspaceId) ?? null;
  }

  async upsertBrandProfile(workspaceId: UUID, patch: Partial<BrandProfile>) {
    const existing = this.db().brand_profiles.find((b) => b.workspace_id === workspaceId);
    if (existing) {
      Object.assign(existing, patch, { updated_at: now() });
      this.save();
      return existing;
    }
    const created: BrandProfile = {
      id: uuid(),
      workspace_id: workspaceId,
      brand_voice: null,
      personality: [],
      style_notes: null,
      preferred_language: 'en',
      primary_color: null,
      secondary_color: null,
      logo_url: null,
      created_at: now(),
      updated_at: now(),
      ...patch,
    };
    this.db().brand_profiles.push(created);
    this.save();
    return created;
  }

  /* ---------------------------------------------------------------- */
  /* Conversations                                                     */
  /* ---------------------------------------------------------------- */

  async createConversation(input: Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>) {
    const conversation: AIConversation = {
      ...input,
      id: uuid(),
      created_at: now(),
      updated_at: now(),
    };
    this.db().ai_conversations.push(conversation);
    this.save();
    return conversation;
  }

  async getConversation(id: UUID) {
    return this.db().ai_conversations.find((c) => c.id === id) ?? null;
  }

  async findConversation(workspaceId: UUID, purpose: AIConversation['purpose']) {
    return (
      [...this.db().ai_conversations]
        .filter((c) => c.workspace_id === workspaceId && c.purpose === purpose)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
    );
  }

  async addMessage(input: Omit<AIMessage, 'id' | 'created_at'>) {
    const message: AIMessage = { ...input, id: uuid(), created_at: now() };
    this.db().ai_messages.push(message);
    const conversation = this.db().ai_conversations.find((c) => c.id === input.conversation_id);
    if (conversation) conversation.updated_at = now();
    this.save();
    return message;
  }

  async listMessages(conversationId: UUID) {
    return this.db()
      .ai_messages.filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  /* ---------------------------------------------------------------- */
  /* Plans & content                                                   */
  /* ---------------------------------------------------------------- */

  async createPlan(input: Omit<ContentPlan, 'id' | 'created_at' | 'updated_at'>) {
    const plan: ContentPlan = { ...input, id: uuid(), created_at: now(), updated_at: now() };
    this.db().content_plans.push(plan);
    this.save();
    return plan;
  }

  async updatePlan(id: UUID, patch: Partial<ContentPlan>) {
    const plan = this.db().content_plans.find((p) => p.id === id);
    if (!plan) return null;
    Object.assign(plan, patch, { updated_at: now() });
    this.save();
    return plan;
  }

  async getPlan(id: UUID) {
    return this.db().content_plans.find((p) => p.id === id) ?? null;
  }

  async listPlans(workspaceId: UUID) {
    return this.db()
      .content_plans.filter((p) => p.workspace_id === workspaceId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async getLatestPlan(workspaceId: UUID) {
    return (await this.listPlans(workspaceId))[0] ?? null;
  }

  async createContentItems(items: Array<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>) {
    const created = items.map((item) => ({
      ...item,
      id: uuid(),
      created_at: now(),
      updated_at: now(),
    }));
    this.db().content_items.push(...created);
    this.save();
    return created;
  }

  async getContentItem(id: UUID) {
    return this.db().content_items.find((c) => c.id === id) ?? null;
  }

  async updateContentItem(id: UUID, patch: Partial<ContentItem>) {
    const item = this.db().content_items.find((c) => c.id === id);
    if (!item) return null;
    Object.assign(item, patch, { updated_at: now() });
    this.save();
    return item;
  }

  async deleteContentItem(id: UUID) {
    const db = this.db();
    const index = db.content_items.findIndex((c) => c.id === id);
    if (index === -1) return false;
    db.content_items.splice(index, 1);
    db.content_variations = db.content_variations.filter((v) => v.content_item_id !== id);
    db.content_assets = db.content_assets.filter((a) => a.content_item_id !== id);
    db.scheduled_posts = db.scheduled_posts.filter((s) => s.content_item_id !== id);
    this.save();
    return true;
  }

  async listContentItems(workspaceId: UUID, query: ContentQuery = {}) {
    let rows = this.db().content_items.filter((c) => c.workspace_id === workspaceId);
    if (query.status && query.status !== 'all') rows = rows.filter((c) => c.status === query.status);
    if (query.platform && query.platform !== 'all') rows = rows.filter((c) => c.platform === query.platform);
    if (query.planId) rows = rows.filter((c) => c.plan_id === query.planId);
    if (query.from) rows = rows.filter((c) => c.scheduled_date >= query.from!);
    if (query.to) rows = rows.filter((c) => c.scheduled_date <= query.to!);
    if (query.search) rows = rows.filter((c) => matchesSearch(c, query.search!));
    rows = rows.sort(
      (a, b) =>
        a.scheduled_date.localeCompare(b.scheduled_date) ||
        a.scheduled_time.localeCompare(b.scheduled_time),
    );
    const offset = query.offset ?? 0;
    return rows.slice(offset, offset + (query.limit ?? rows.length));
  }

  async countContentByStatus(workspaceId: UUID) {
    const base: Record<ContentStatus, number> = {
      draft: 0,
      generated: 0,
      approved: 0,
      scheduled: 0,
      published: 0,
      failed: 0,
    };
    for (const item of this.db().content_items) {
      if (item.workspace_id !== workspaceId) continue;
      base[item.status] += 1;
    }
    return base;
  }

  async countAllContent() {
    return this.db().content_items.length;
  }

  async addVariation(input: Omit<ContentVariation, 'id' | 'created_at'>) {
    const variation: ContentVariation = { ...input, id: uuid(), created_at: now() };
    this.db().content_variations.push(variation);
    this.save();
    return variation;
  }

  async listVariations(contentItemId: UUID) {
    return this.db().content_variations.filter((v) => v.content_item_id === contentItemId);
  }

  async addAsset(input: Omit<ContentAsset, 'id' | 'created_at'>) {
    const asset: ContentAsset = { ...input, id: uuid(), created_at: now() };
    this.db().content_assets.push(asset);
    this.save();
    return asset;
  }

  async listAssets(contentItemId: UUID) {
    return this.db().content_assets.filter((a) => a.content_item_id === contentItemId);
  }

  /* ---------------------------------------------------------------- */
  /* Social                                                            */
  /* ---------------------------------------------------------------- */

  async listSocialAccounts(workspaceId: UUID) {
    return this.db().social_accounts.filter((a) => a.workspace_id === workspaceId);
  }

  async upsertSocialAccount(workspaceId: UUID, platform: PlatformId, patch: Partial<SocialAccount>) {
    const existing = this.db().social_accounts.find(
      (a) => a.workspace_id === workspaceId && a.platform === platform,
    );
    if (existing) {
      Object.assign(existing, patch);
      this.save();
      return existing;
    }
    const created: SocialAccount = {
      id: uuid(),
      workspace_id: workspaceId,
      platform,
      external_account_id: null,
      display_name: null,
      status: 'not_connected',
      connected_at: null,
      created_at: now(),
      ...patch,
    };
    this.db().social_accounts.push(created);
    this.save();
    return created;
  }

  /* ---------------------------------------------------------------- */
  /* Scheduling & publishing                                           */
  /* ---------------------------------------------------------------- */

  async createScheduledPost(input: Omit<ScheduledPost, 'id' | 'created_at'>) {
    const post: ScheduledPost = { ...input, id: uuid(), created_at: now() };
    this.db().scheduled_posts.push(post);
    this.save();
    return post;
  }

  async updateScheduledPost(id: UUID, patch: Partial<ScheduledPost>) {
    const post = this.db().scheduled_posts.find((s) => s.id === id);
    if (!post) return null;
    Object.assign(post, patch);
    this.save();
    return post;
  }

  async listScheduledPosts(workspaceId: UUID) {
    return this.db()
      .scheduled_posts.filter((s) => s.workspace_id === workspaceId)
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }

  async findScheduledPostByContent(contentItemId: UUID) {
    return (
      [...this.db().scheduled_posts]
        .filter((s) => s.content_item_id === contentItemId && s.status !== 'cancelled')
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
    );
  }

  async createPublishingJob(input: Omit<PublishingJob, 'id' | 'created_at' | 'updated_at'>) {
    const job: PublishingJob = { ...input, id: uuid(), created_at: now(), updated_at: now() };
    this.db().publishing_jobs.push(job);
    this.save();
    return job;
  }

  async updatePublishingJob(id: UUID, patch: Partial<PublishingJob>) {
    const job = this.db().publishing_jobs.find((j) => j.id === id);
    if (!job) return null;
    Object.assign(job, patch, { updated_at: now() });
    this.save();
    return job;
  }

  async listPublishingJobs(workspaceId?: UUID, limit = 100) {
    return this.db()
      .publishing_jobs.filter((j) => (workspaceId ? j.workspace_id === workspaceId : true))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  async listDuePublishingJobs(nowISO: string, limit = 25) {
    return this.db()
      .publishing_jobs.filter(
        (j) => (j.status === 'queued' || j.status === 'retrying') && j.run_after <= nowISO,
      )
      .sort((a, b) => a.run_after.localeCompare(b.run_after))
      .slice(0, limit);
  }

  /* ---------------------------------------------------------------- */
  /* Analytics                                                         */
  /* ---------------------------------------------------------------- */

  async listAnalytics(workspaceId: UUID) {
    return this.db().analytics.filter((a) => a.workspace_id === workspaceId);
  }

  /* ---------------------------------------------------------------- */
  /* Billing & usage                                                   */
  /* ---------------------------------------------------------------- */

  async getSubscription(workspaceId: UUID) {
    return this.db().subscriptions.find((s) => s.workspace_id === workspaceId) ?? null;
  }

  async upsertSubscription(workspaceId: UUID, patch: Partial<Subscription>) {
    const existing = this.db().subscriptions.find((s) => s.workspace_id === workspaceId);
    if (existing) {
      Object.assign(existing, patch);
      this.save();
      return existing;
    }
    const created: Subscription = {
      id: uuid(),
      workspace_id: workspaceId,
      plan_id: 'free',
      interval: 'monthly',
      status: 'not_configured',
      current_period_end: null,
      cancel_at_period_end: false,
      created_at: now(),
      ...patch,
    };
    this.db().subscriptions.push(created);
    this.save();
    return created;
  }

  async listSubscriptions(limit = 200) {
    return this.db().subscriptions.slice(0, limit);
  }

  async addUsage(input: Omit<UsageRecord, 'id' | 'created_at'>) {
    const record: UsageRecord = { ...input, id: uuid(), created_at: now() };
    this.db().usage_records.push(record);
    this.save();
    return record;
  }

  async listUsage(workspaceId: UUID, period?: string) {
    return this.db().usage_records.filter(
      (u) => u.workspace_id === workspaceId && (period ? u.period === period : true),
    );
  }

  async listAllUsage(period?: string, limit = 500) {
    return this.db()
      .usage_records.filter((u) => (period ? u.period === period : true))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  async sumUsage(workspaceId: UUID, metric: UsageMetric, period: string) {
    return this.db()
      .usage_records.filter(
        (u) => u.workspace_id === workspaceId && u.metric === metric && u.period === period,
      )
      .reduce((total, u) => total + u.quantity, 0);
  }

  /* ---------------------------------------------------------------- */
  /* Notifications & logs                                              */
  /* ---------------------------------------------------------------- */

  async addNotification(input: Omit<Notification, 'id' | 'created_at'>) {
    const notification: Notification = { ...input, id: uuid(), created_at: now() };
    this.db().notifications.push(notification);
    this.save();
    return notification;
  }

  async listNotifications(userId: UUID, limit = 30) {
    return this.db()
      .notifications.filter((n) => n.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  async markNotificationsRead(userId: UUID) {
    for (const n of this.db().notifications) {
      if (n.user_id === userId && !n.read_at) n.read_at = now();
    }
    this.save();
  }

  async addLog(input: Omit<SystemLog, 'id' | 'created_at'>) {
    const log: SystemLog = { ...input, id: uuid(), created_at: now() };
    const db = this.db();
    db.system_logs.push(log);
    if (db.system_logs.length > 2000) db.system_logs.splice(0, db.system_logs.length - 2000);
    this.save();
    return log;
  }

  async listLogs(limit = 200) {
    return [...this.db().system_logs]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  /* ---------------------------------------------------------------- */
  /* Admin                                                             */
  /* ---------------------------------------------------------------- */

  async adminStats(): Promise<AdminStats> {
    const db = this.db();
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const byStatus = db.content_items.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
    const subsByPlan = db.subscriptions.reduce<Record<string, number>>((acc, sub) => {
      acc[sub.plan_id] = (acc[sub.plan_id] ?? 0) + 1;
      return acc;
    }, {});
    return {
      users: db.profiles.length,
      workspaces: db.workspaces.length,
      activeUsers7d: new Set(
        db.ai_conversations.filter((c) => c.updated_at >= weekAgo).map((c) => c.user_id),
      ).size,
      contentItems: db.content_items.length,
      approved: byStatus.approved ?? 0,
      scheduled: byStatus.scheduled ?? 0,
      published: byStatus.published ?? 0,
      failedJobs: db.publishing_jobs.filter((j) => j.status === 'failed').length,
      aiRequests: db.usage_records
        .filter((u) => u.metric === 'ai_request')
        .reduce((total, u) => total + u.quantity, 0),
      subscriptionsByPlan: subsByPlan,
    };
  }

  /* ---------------------------------------------------------------- */
  /* Development credentials                                           */
  /* ---------------------------------------------------------------- */

  async devCreateCredentials(email: string, password: string, userId: UUID) {
    const { hash, salt } = hashPassword(password);
    this.db().credentials.push({ email: email.trim().toLowerCase(), user_id: userId, hash, salt });
    this.save();
  }

  async devVerifyCredentials(email: string, password: string) {
    const record = this.db().credentials.find((c) => c.email === email.trim().toLowerCase());
    if (!record) return null;
    return verifyPassword(password, record.salt, record.hash) ? record.user_id : null;
  }

  async devSetPassword(userId: UUID, password: string) {
    const record = this.db().credentials.find((c) => c.user_id === userId);
    if (!record) return;
    const { hash, salt } = hashPassword(password);
    record.hash = hash;
    record.salt = salt;
    this.save();
  }

  async devCreateResetToken(email: string) {
    const record = this.db().credentials.find((c) => c.email === email.trim().toLowerCase());
    if (!record) return null;
    const token = randomBytes(24).toString('hex');
    this.db().reset_tokens.push({
      token,
      user_id: record.user_id,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    this.save();
    return token;
  }

  async devConsumeResetToken(token: string) {
    const db = this.db();
    const index = db.reset_tokens.findIndex((t) => t.token === token);
    if (index === -1) return null;
    const entry = db.reset_tokens[index];
    db.reset_tokens.splice(index, 1);
    this.save();
    if (entry.expires_at < now()) return null;
    return entry.user_id;
  }
}
