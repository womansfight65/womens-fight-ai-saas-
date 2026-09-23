import 'server-only';

import { getStore } from '@/lib/data';
import { socialService } from '@/lib/social/social-service';
import type { AnalyticsRecord, PlatformId, UUID } from '@/types';

interface Totals {
  posts: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  followerDelta: number;
}

export interface PlatformAnalytics {
  platform: PlatformId;
  name: string;
  accent: string;
  displayName: string | null;
  hasData: boolean;
  totals: Totals;
}

export interface AnalyticsSummary {
  hasConnectedPlatform: boolean;
  hasData: boolean;
  totals: Totals;
  records: AnalyticsRecord[];
  /** One entry per connected account, even with zero data yet — never one per platform that isn't connected. */
  byPlatform: PlatformAnalytics[];
  /** Only produced from real data — never invented. */
  insights: string[];
}

const EMPTY_TOTALS: Totals = {
  posts: 0,
  reach: 0,
  impressions: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  views: 0,
  followerDelta: 0,
};

function sumTotals(records: AnalyticsRecord[]): Totals {
  return records.reduce(
    (acc, r) => ({
      posts: acc.posts + 1,
      reach: acc.reach + r.reach,
      impressions: acc.impressions + r.impressions,
      likes: acc.likes + r.likes,
      comments: acc.comments + r.comments,
      shares: acc.shares + r.shares,
      saves: acc.saves + r.saves,
      views: acc.views + r.views,
      followerDelta: acc.followerDelta + r.follower_delta,
    }),
    { ...EMPTY_TOTALS },
  );
}

/**
 * Analytics only ever reports what a platform actually returned. With no
 * connected account there are no numbers, and the UI shows an empty state
 * rather than a demo chart. Each connected account gets its own honest
 * breakdown — including a "nothing yet" one, never a platform that isn't
 * actually connected.
 */
class AnalyticsService {
  async summary(workspaceId: UUID): Promise<AnalyticsSummary> {
    const store = await getStore();
    const [records, connections] = await Promise.all([
      store.listAnalytics(workspaceId),
      socialService.listConnections(workspaceId),
    ]);

    const connected = connections.filter((c) => c.status === 'connected');

    const byPlatform: PlatformAnalytics[] = connected.map((connection) => {
      const platformRecords = records.filter((r) => r.platform === connection.platform);
      return {
        platform: connection.platform,
        name: connection.name,
        accent: connection.accent,
        displayName: connection.account?.display_name ?? null,
        hasData: platformRecords.length > 0,
        totals: platformRecords.length ? sumTotals(platformRecords) : { ...EMPTY_TOTALS },
      };
    });

    if (!records.length) {
      return {
        hasConnectedPlatform: connected.length > 0,
        hasData: false,
        totals: { ...EMPTY_TOTALS },
        records: [],
        byPlatform,
        insights: [],
      };
    }

    return {
      hasConnectedPlatform: connected.length > 0,
      hasData: true,
      totals: sumTotals(records),
      records,
      byPlatform,
      insights: this.deriveInsights(records),
    };
  }

  /** Observations computed from the rows above — not model guesses. */
  private deriveInsights(records: AnalyticsRecord[]): string[] {
    const byPlatform = new Map<string, { engagement: number; count: number }>();
    for (const r of records) {
      const current = byPlatform.get(r.platform) ?? { engagement: 0, count: 0 };
      current.engagement += r.likes + r.comments + r.shares + r.saves;
      current.count += 1;
      byPlatform.set(r.platform, current);
    }
    const ranked = [...byPlatform.entries()]
      .map(([platform, v]) => ({ platform, avg: v.engagement / Math.max(v.count, 1) }))
      .sort((a, b) => b.avg - a.avg);

    if (ranked.length < 2) return [];
    return [
      `${ranked[0].platform} is your strongest platform right now, averaging ${Math.round(ranked[0].avg)} interactions per post.`,
    ];
  }
}

export const analyticsService = new AnalyticsService();
