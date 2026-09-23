import 'server-only';

import { getAdminStore } from '@/lib/data';
import { logger } from '@/lib/utils/logger';
import { notificationService } from '@/lib/notifications/notification-service';
import { getSocialProvider } from '@/lib/social/social-service';
import type { PublishingJob } from '@/types';

const MAX_ATTEMPTS = 3;
const BACKOFF_MINUTES = [5, 20, 60];

export interface WorkerRunResult {
  picked: number;
  published: number;
  failed: number;
  retrying: number;
  blocked: number;
}

/**
 * The publishing worker.
 *
 * Its one rule: a post is marked published only when a platform API returned a
 * post id. Anything else is a failure or a retry — never a green tick.
 */
class PublishingService {
  async runDueJobs(limit = 20): Promise<WorkerRunResult> {
    const store = await getAdminStore();
    const nowISO = new Date().toISOString();
    const jobs = await store.listDuePublishingJobs(nowISO, limit);

    const result: WorkerRunResult = {
      picked: jobs.length,
      published: 0,
      failed: 0,
      retrying: 0,
      blocked: 0,
    };

    for (const job of jobs) {
      const outcome = await this.runJob(job);
      result[outcome] += 1;
    }

    if (jobs.length) {
      await logger.info('publishing', 'Worker run finished', { ...result });
    }
    return result;
  }

  private async runJob(job: PublishingJob): Promise<'published' | 'failed' | 'retrying' | 'blocked'> {
    const store = await getAdminStore();
    const posts = await store.listScheduledPosts(job.workspace_id);
    const post = posts.find((p) => p.id === job.scheduled_post_id);

    if (!post || post.status === 'cancelled') {
      await store.updatePublishingJob(job.id, { status: 'blocked', last_error: 'Post cancelled.' });
      return 'blocked';
    }

    const item = await store.getContentItem(post.content_item_id);
    if (!item) {
      await store.updatePublishingJob(job.id, { status: 'blocked', last_error: 'Content deleted.' });
      return 'blocked';
    }

    if (!post.social_account_id) {
      await store.updatePublishingJob(job.id, {
        status: 'blocked',
        last_error: 'No connected account for this platform.',
      });
      return 'blocked';
    }

    await store.updatePublishingJob(job.id, { status: 'publishing' });
    await store.updateScheduledPost(post.id, { status: 'publishing' });

    const provider = getSocialProvider(job.platform);
    const outcome = await provider.publish({ item, accountId: post.social_account_id });
    const attempt = job.attempt_count + 1;

    if (outcome.ok) {
      const publishedAt = new Date().toISOString();
      await store.updatePublishingJob(job.id, {
        status: 'published',
        attempt_count: attempt,
        last_error: null,
      });
      await store.updateScheduledPost(post.id, {
        status: 'published',
        attempt_count: attempt,
        published_at: publishedAt,
        external_post_id: outcome.externalPostId,
      });
      await store.updateContentItem(item.id, { status: 'published' });
      const workspace = await store.getWorkspace(job.workspace_id);
      if (workspace) {
        await notificationService.notify({
          workspaceId: job.workspace_id,
          userId: workspace.owner_id,
          kind: 'content_published',
          title: 'Content published',
          body: item.topic,
        });
      }
      return 'published';
    }

    const canRetry = outcome.retryable && attempt < MAX_ATTEMPTS;
    if (canRetry) {
      const delay = BACKOFF_MINUTES[Math.min(attempt - 1, BACKOFF_MINUTES.length - 1)];
      await store.updatePublishingJob(job.id, {
        status: 'retrying',
        attempt_count: attempt,
        last_error: outcome.error,
        run_after: new Date(Date.now() + delay * 60_000).toISOString(),
      });
      await store.updateScheduledPost(post.id, { status: 'queued', attempt_count: attempt });
      return 'retrying';
    }

    await store.updatePublishingJob(job.id, {
      status: 'failed',
      attempt_count: attempt,
      last_error: outcome.error,
    });
    await store.updateScheduledPost(post.id, {
      status: 'failed',
      attempt_count: attempt,
      error_message: outcome.error,
    });
    await store.updateContentItem(item.id, { status: 'failed' });
    await logger.warn('publishing', 'Publish failed', {
      workspaceId: job.workspace_id,
      platform: job.platform,
      error: outcome.error,
    });
    return 'failed';
  }
}

export const publishingService = new PublishingService();
