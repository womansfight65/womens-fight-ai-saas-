import 'server-only';

import { getStore } from '@/lib/data';
import type { Notification, NotificationKind, UUID } from '@/types';

export interface NotifyInput {
  workspaceId: UUID;
  userId: UUID;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
}

/**
 * In-app notifications. Email and push are future channels; the service is the
 * single place they will be added, so nothing else has to change.
 */
class NotificationService {
  async notify(input: NotifyInput): Promise<Notification | null> {
    try {
      const store = await getStore();
      return await store.addNotification({
        workspace_id: input.workspaceId,
        user_id: input.userId,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
        read_at: null,
      });
    } catch {
      return null;
    }
  }

  async list(userId: UUID, limit = 20): Promise<Notification[]> {
    const store = await getStore();
    return store.listNotifications(userId, limit);
  }

  async markAllRead(userId: UUID): Promise<void> {
    const store = await getStore();
    await store.markNotificationsRead(userId);
  }

  async unreadCount(userId: UUID): Promise<number> {
    const list = await this.list(userId, 50);
    return list.filter((n) => !n.read_at).length;
  }
}

export const notificationService = new NotificationService();
