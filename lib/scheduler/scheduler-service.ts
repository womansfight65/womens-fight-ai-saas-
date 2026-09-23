import 'server-only';

import { getStore } from '@/lib/data';
import { logger } from '@/lib/utils/logger';
import { usageService } from '@/lib/usage/usage-service';
import type { PlatformId, ScheduledPost, ServiceResult, UUID } from '@/types';

export interface ScheduleInput {
  workspaceId: UUID;
  contentItemId: UUID;
  scheduledAt: string;
  timezone: string;
  platform: PlatformId;
}

/**
 * Turns an approved post into a scheduled post plus a queued publishing job.
 *
 * The queue is deliberately stored in the database, not in the browser: a
 * publish happens because a worker picked up a row, which means closing the tab
 * changes nothing. `/api/scheduler/run` is the worker entry point, meant to be
 * called by cron.
 */
class SchedulerService {
  async schedule(input: ScheduleInput): Promise<ServiceResult<ScheduledPost>> {
    const store = await getStore();

    const existing = await store.findScheduledPostByContent(input.contentItemId);
    if (existing && existing.status !== 'published') {
      await store.updateScheduledPost(existing.id, {
        scheduled_at: input.scheduledAt,
        timezone: input.timezone,
        status: 'scheduled',
        error_message: null,
      });
      await this.syncJob(existing.id, input, existing.workspace_id);
      const updated = await store.updateScheduledPost(existing.id, {});
      return { ok: true, data: updated ?? existing };
    }

    const accounts = await store.listSocialAccounts(input.workspaceId);
    const account = accounts.find((a) => a.platform === input.platform && a.status === 'connected');

    const post = await store.createScheduledPost({
      workspace_id: input.workspaceId,
      content_item_id: input.contentItemId,
      social_account_id: account?.id ?? null,
      scheduled_at: input.scheduledAt,
      timezone: input.timezone,
      status: 'scheduled',
      attempt_count: 0,
      error_message: null,
      published_at: null,
      external_post_id: null,
    });

    await store.createPublishingJob({
      workspace_id: input.workspaceId,
      scheduled_post_id: post.id,
      platform: input.platform,
      // Without a connected account there is nothing to publish to. The job is
      // recorded as blocked instead of quietly disappearing.
      status: account ? 'queued' : 'blocked',
      attempt_count: 0,
      last_error: account ? null : 'No connected account for this platform.',
      run_after: input.scheduledAt,
    });

    await usageService.record({
      workspaceId: input.workspaceId,
      metric: 'publishing_job',
      metadata: { platform: input.platform },
    });

    await logger.info('scheduler', 'Post scheduled', {
      workspaceId: input.workspaceId,
      scheduled_post_id: post.id,
      platform: input.platform,
      blocked: !account,
    });

    return { ok: true, data: post };
  }

  private async syncJob(scheduledPostId: UUID, input: ScheduleInput, workspaceId: UUID) {
    const store = await getStore();
    const jobs = await store.listPublishingJobs(workspaceId, 200);
    const job = jobs.find((j) => j.scheduled_post_id === scheduledPostId);
    if (job) {
      await store.updatePublishingJob(job.id, {
        run_after: input.scheduledAt,
        status: job.status === 'blocked' ? 'blocked' : 'queued',
        last_error: job.status === 'blocked' ? job.last_error : null,
      });
    }
  }

  async reschedule(contentItemId: UUID, scheduledAt: string): Promise<void> {
    const store = await getStore();
    const post = await store.findScheduledPostByContent(contentItemId);
    if (!post) return;
    await store.updateScheduledPost(post.id, { scheduled_at: scheduledAt, status: 'scheduled' });
    const jobs = await store.listPublishingJobs(post.workspace_id, 200);
    const job = jobs.find((j) => j.scheduled_post_id === post.id);
    if (job && job.status !== 'published') {
      await store.updatePublishingJob(job.id, { run_after: scheduledAt });
    }
  }

  async cancelForContent(contentItemId: UUID): Promise<void> {
    const store = await getStore();
    const post = await store.findScheduledPostByContent(contentItemId);
    if (!post || post.status === 'published') return;
    await store.updateScheduledPost(post.id, { status: 'cancelled' });
    const jobs = await store.listPublishingJobs(post.workspace_id, 200);
    const job = jobs.find((j) => j.scheduled_post_id === post.id);
    if (job && job.status !== 'published') {
      await store.updatePublishingJob(job.id, { status: 'blocked', last_error: 'Cancelled by user.' });
    }
  }

  async upcoming(workspaceId: UUID, limit = 5): Promise<ScheduledPost[]> {
    const store = await getStore();
    const nowISO = new Date().toISOString();
    return (await store.listScheduledPosts(workspaceId))
      .filter((p) => p.status === 'scheduled' && p.scheduled_at >= nowISO)
      .slice(0, limit);
  }
}

export const schedulerService = new SchedulerService();
