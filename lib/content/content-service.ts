import 'server-only';

import { getStore, type ContentQuery } from '@/lib/data';
import { combineDateTime } from '@/lib/utils/date';
import { normalizeHashtags } from '@/lib/utils/text';
import { notificationService } from '@/lib/notifications/notification-service';
import { logger } from '@/lib/utils/logger';
import { schedulerService } from '@/lib/scheduler/scheduler-service';
import type { ContentItem, ContentStatus, ServiceResult, UUID } from '@/types';

export interface ContentPatch {
  topic?: string;
  hook?: string;
  caption?: string;
  cta?: string;
  hashtags?: string[] | string;
  scheduled_date?: string;
  scheduled_time?: string;
  platform?: ContentItem['platform'];
  content_type?: ContentItem['content_type'];
  objective?: ContentItem['objective'];
  image_concept?: string | null;
  video_concept?: string | null;
}

/**
 * Everything that happens to a piece of content after it exists. The approval
 * rule lives here: nothing reaches a scheduler without an explicit approval.
 */
class ContentService {
  async get(workspaceId: UUID, id: UUID): Promise<ContentItem | null> {
    const store = await getStore();
    const item = await store.getContentItem(id);
    if (!item || item.workspace_id !== workspaceId) return null;
    return item;
  }

  async list(workspaceId: UUID, query: ContentQuery = {}): Promise<ContentItem[]> {
    const store = await getStore();
    return store.listContentItems(workspaceId, query);
  }

  async stats(workspaceId: UUID): Promise<Record<ContentStatus, number>> {
    const store = await getStore();
    return store.countContentByStatus(workspaceId);
  }

  async update(
    workspaceId: UUID,
    id: UUID,
    patch: ContentPatch,
  ): Promise<ServiceResult<ContentItem>> {
    const item = await this.get(workspaceId, id);
    if (!item) return { ok: false, error: 'That content no longer exists.' };

    const store = await getStore();
    const next: Partial<ContentItem> = {};
    if (patch.topic !== undefined) next.topic = patch.topic.trim();
    if (patch.hook !== undefined) next.hook = patch.hook.trim();
    if (patch.caption !== undefined) next.caption = patch.caption;
    if (patch.cta !== undefined) next.cta = patch.cta.trim();
    if (patch.hashtags !== undefined) next.hashtags = normalizeHashtags(patch.hashtags);
    if (patch.scheduled_date) next.scheduled_date = patch.scheduled_date;
    if (patch.scheduled_time) next.scheduled_time = patch.scheduled_time;
    if (patch.platform) next.platform = patch.platform;
    if (patch.content_type) next.content_type = patch.content_type;
    if (patch.objective) next.objective = patch.objective;
    if (patch.image_concept !== undefined) next.image_concept = patch.image_concept;
    if (patch.video_concept !== undefined) next.video_concept = patch.video_concept;

    // A manual edit sends approved content back for review — the user should
    // re-approve what they changed.
    if (
      (item.status === 'approved' || item.status === 'scheduled') &&
      (next.caption || next.hook || next.cta)
    ) {
      next.status = 'generated';
      next.approved_at = null;
      await schedulerService.cancelForContent(item.id);
    }

    const updated = await store.updateContentItem(id, next);
    if (!updated) return { ok: false, error: 'Could not save those changes.' };
    return { ok: true, data: updated };
  }

  async approve(workspaceId: UUID, userId: UUID, id: UUID): Promise<ServiceResult<ContentItem>> {
    const item = await this.get(workspaceId, id);
    if (!item) return { ok: false, error: 'That content no longer exists.' };

    const store = await getStore();
    const updated = await store.updateContentItem(id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
    if (!updated) return { ok: false, error: 'Could not approve that content.' };

    await notificationService.notify({
      workspaceId,
      userId,
      kind: 'content_approved',
      title: 'Content approved',
      body: updated.topic,
      href: `/dashboard/library?item=${updated.id}`,
    });
    return { ok: true, data: updated };
  }

  async unapprove(workspaceId: UUID, id: UUID): Promise<ServiceResult<ContentItem>> {
    const item = await this.get(workspaceId, id);
    if (!item) return { ok: false, error: 'That content no longer exists.' };
    await schedulerService.cancelForContent(id);
    const store = await getStore();
    const updated = await store.updateContentItem(id, { status: 'generated', approved_at: null });
    return updated ? { ok: true, data: updated } : { ok: false, error: 'Could not update that content.' };
  }

  /**
   * Approval-first automation: scheduling is refused outright for content the
   * user has not approved.
   */
  async schedule(params: {
    workspaceId: UUID;
    userId: UUID;
    id: UUID;
    date?: string;
    time?: string;
    timezone?: string;
  }): Promise<ServiceResult<ContentItem>> {
    const item = await this.get(params.workspaceId, params.id);
    if (!item) return { ok: false, error: 'That content no longer exists.' };
    if (item.status !== 'approved' && item.status !== 'scheduled') {
      return { ok: false, error: 'Approve this content before scheduling it.', code: 'not_approved' };
    }

    const store = await getStore();
    const date = params.date ?? item.scheduled_date;
    const time = params.time ?? item.scheduled_time;
    const workspace = await store.getWorkspace(params.workspaceId);
    const timezone = params.timezone ?? workspace?.timezone ?? 'Asia/Dhaka';

    const scheduled = await schedulerService.schedule({
      workspaceId: params.workspaceId,
      contentItemId: item.id,
      scheduledAt: combineDateTime(date, time, timezone),
      timezone,
      platform: item.platform,
    });

    if (!scheduled.ok) return { ok: false, error: scheduled.error };

    const updated = await store.updateContentItem(item.id, {
      status: 'scheduled',
      scheduled_date: date,
      scheduled_time: time,
    });

    await notificationService.notify({
      workspaceId: params.workspaceId,
      userId: params.userId,
      kind: 'content_scheduled',
      title: 'Content scheduled',
      body: `${item.topic} — ${date} at ${time}`,
      href: '/dashboard/calendar',
    });

    await logger.info('content', 'Content scheduled', {
      workspaceId: params.workspaceId,
      contentId: item.id,
    });

    return updated ? { ok: true, data: updated } : { ok: false, error: 'Could not schedule that content.' };
  }

  async reschedule(
    workspaceId: UUID,
    id: UUID,
    date: string,
    time?: string,
  ): Promise<ServiceResult<ContentItem>> {
    const item = await this.get(workspaceId, id);
    if (!item) return { ok: false, error: 'That content no longer exists.' };
    const store = await getStore();
    const updated = await store.updateContentItem(id, {
      scheduled_date: date,
      scheduled_time: time ?? item.scheduled_time,
    });
    if (item.status === 'scheduled') {
      await schedulerService.reschedule(
        id,
        combineDateTime(date, time ?? item.scheduled_time),
      );
    }
    return updated ? { ok: true, data: updated } : { ok: false, error: 'Could not move that content.' };
  }

  async remove(workspaceId: UUID, id: UUID): Promise<ServiceResult<true>> {
    const item = await this.get(workspaceId, id);
    if (!item) return { ok: false, error: 'That content no longer exists.' };
    await schedulerService.cancelForContent(id);
    const store = await getStore();
    const done = await store.deleteContentItem(id);
    return done ? { ok: true, data: true } : { ok: false, error: 'Could not delete that content.' };
  }
}

export const contentService = new ContentService();
