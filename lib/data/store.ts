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

export interface ContentQuery {
  status?: ContentStatus | 'all';
  platform?: PlatformId | 'all';
  planId?: UUID | null;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AdminStats {
  users: number;
  workspaces: number;
  activeUsers7d: number;
  contentItems: number;
  approved: number;
  scheduled: number;
  published: number;
  failedJobs: number;
  aiRequests: number;
  subscriptionsByPlan: Record<string, number>;
}

/**
 * Every persistence path in the product goes through this interface, so the
 * app can run either on Supabase/Postgres or on the local development store
 * without a single call site changing.
 */
export interface DataStore {
  readonly kind: 'supabase' | 'development';

  /* Profiles -------------------------------------------------------- */
  getProfile(id: UUID): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  createProfile(input: Partial<Profile> & { id: UUID; email: string }): Promise<Profile>;
  updateProfile(id: UUID, patch: Partial<Profile>): Promise<Profile | null>;
  listProfiles(limit?: number): Promise<Profile[]>;
  countProfiles(): Promise<number>;

  /* Workspaces ------------------------------------------------------ */
  createWorkspace(input: { owner_id: UUID; name: string; timezone?: string }): Promise<Workspace>;
  getWorkspace(id: UUID): Promise<Workspace | null>;
  listWorkspacesForUser(userId: UUID): Promise<Workspace[]>;
  listWorkspaces(limit?: number): Promise<Workspace[]>;
  updateWorkspace(id: UUID, patch: Partial<Workspace>): Promise<Workspace | null>;
  addWorkspaceMember(input: Omit<WorkspaceMember, 'id' | 'created_at'>): Promise<WorkspaceMember>;
  listWorkspaceMembers(workspaceId: UUID): Promise<WorkspaceMember[]>;

  /* Business Brain -------------------------------------------------- */
  getBusinessProfile(workspaceId: UUID): Promise<BusinessProfile | null>;
  upsertBusinessProfile(workspaceId: UUID, patch: Partial<BusinessProfile>): Promise<BusinessProfile>;
  getBrandProfile(workspaceId: UUID): Promise<BrandProfile | null>;
  upsertBrandProfile(workspaceId: UUID, patch: Partial<BrandProfile>): Promise<BrandProfile>;

  /* Conversations --------------------------------------------------- */
  createConversation(input: Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>): Promise<AIConversation>;
  getConversation(id: UUID): Promise<AIConversation | null>;
  findConversation(workspaceId: UUID, purpose: AIConversation['purpose']): Promise<AIConversation | null>;
  addMessage(input: Omit<AIMessage, 'id' | 'created_at'>): Promise<AIMessage>;
  listMessages(conversationId: UUID): Promise<AIMessage[]>;

  /* Plans & content ------------------------------------------------- */
  createPlan(input: Omit<ContentPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ContentPlan>;
  updatePlan(id: UUID, patch: Partial<ContentPlan>): Promise<ContentPlan | null>;
  getPlan(id: UUID): Promise<ContentPlan | null>;
  listPlans(workspaceId: UUID): Promise<ContentPlan[]>;
  getLatestPlan(workspaceId: UUID): Promise<ContentPlan | null>;

  createContentItems(items: Array<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>): Promise<ContentItem[]>;
  getContentItem(id: UUID): Promise<ContentItem | null>;
  updateContentItem(id: UUID, patch: Partial<ContentItem>): Promise<ContentItem | null>;
  deleteContentItem(id: UUID): Promise<boolean>;
  listContentItems(workspaceId: UUID, query?: ContentQuery): Promise<ContentItem[]>;
  countContentByStatus(workspaceId: UUID): Promise<Record<ContentStatus, number>>;
  countAllContent(): Promise<number>;

  addVariation(input: Omit<ContentVariation, 'id' | 'created_at'>): Promise<ContentVariation>;
  listVariations(contentItemId: UUID): Promise<ContentVariation[]>;

  addAsset(input: Omit<ContentAsset, 'id' | 'created_at'>): Promise<ContentAsset>;
  listAssets(contentItemId: UUID): Promise<ContentAsset[]>;

  /* Social ---------------------------------------------------------- */
  listSocialAccounts(workspaceId: UUID): Promise<SocialAccount[]>;
  upsertSocialAccount(workspaceId: UUID, platform: PlatformId, patch: Partial<SocialAccount>): Promise<SocialAccount>;

  /* Scheduling & publishing ----------------------------------------- */
  createScheduledPost(input: Omit<ScheduledPost, 'id' | 'created_at'>): Promise<ScheduledPost>;
  updateScheduledPost(id: UUID, patch: Partial<ScheduledPost>): Promise<ScheduledPost | null>;
  listScheduledPosts(workspaceId: UUID): Promise<ScheduledPost[]>;
  findScheduledPostByContent(contentItemId: UUID): Promise<ScheduledPost | null>;

  createPublishingJob(input: Omit<PublishingJob, 'id' | 'created_at' | 'updated_at'>): Promise<PublishingJob>;
  updatePublishingJob(id: UUID, patch: Partial<PublishingJob>): Promise<PublishingJob | null>;
  listPublishingJobs(workspaceId?: UUID, limit?: number): Promise<PublishingJob[]>;
  listDuePublishingJobs(now: string, limit?: number): Promise<PublishingJob[]>;

  /* Analytics ------------------------------------------------------- */
  listAnalytics(workspaceId: UUID): Promise<AnalyticsRecord[]>;

  /* Billing & usage ------------------------------------------------- */
  getSubscription(workspaceId: UUID): Promise<Subscription | null>;
  upsertSubscription(workspaceId: UUID, patch: Partial<Subscription>): Promise<Subscription>;
  listSubscriptions(limit?: number): Promise<Subscription[]>;

  addUsage(input: Omit<UsageRecord, 'id' | 'created_at'>): Promise<UsageRecord>;
  listUsage(workspaceId: UUID, period?: string): Promise<UsageRecord[]>;
  listAllUsage(period?: string, limit?: number): Promise<UsageRecord[]>;
  sumUsage(workspaceId: UUID, metric: UsageMetric, period: string): Promise<number>;

  /* Notifications & logs -------------------------------------------- */
  addNotification(input: Omit<Notification, 'id' | 'created_at'>): Promise<Notification>;
  listNotifications(userId: UUID, limit?: number): Promise<Notification[]>;
  markNotificationsRead(userId: UUID): Promise<void>;

  addLog(input: Omit<SystemLog, 'id' | 'created_at'>): Promise<SystemLog>;
  listLogs(limit?: number): Promise<SystemLog[]>;

  /* Admin ----------------------------------------------------------- */
  adminStats(): Promise<AdminStats>;

  /* Development-store only: local credential storage ----------------- */
  devCreateCredentials?(email: string, password: string, userId: UUID): Promise<void>;
  devVerifyCredentials?(email: string, password: string): Promise<UUID | null>;
  devSetPassword?(userId: UUID, password: string): Promise<void>;
  devCreateResetToken?(email: string): Promise<string | null>;
  devConsumeResetToken?(token: string): Promise<UUID | null>;
}
