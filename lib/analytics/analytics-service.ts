import 'server-only';

import { getStore } from '@/lib/data';
import { socialService } from '@/lib/social/social-service';
import type { AnalyticsRecord, UUID } from '@/types';

export interface AnalyticsSummary {
  hasConnectedPlatform: boolean;
  hasData: boolean;
  totals: {
    posts: number;
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
    followerDelta: number;
  };
  records: AnalyticsRecord[];
  /** Only produced from real data — never invented. */
  insights: string[];
}

const EMPTY_TOTALS = {
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

/**
 * Analytics only ever reports what a platform actually returned. With no
 * connected account there are no numbers, and the UI shows an empty state
 * rather than a demo chart.
 */
class AnalyticsService {
  async summary(workspaceId: UUID): Promise<AnalyticsSummary> {
    const store = await getStore();
    const [records, connected] = await Promise.all([
      store.listAnalytics(workspaceId),
      socialService.connectedPlatforms(workspaceId),
    ]);

    if (!records.length) {
      return {
        hasConnectedPlatform: connected.length > 0,
        hasData: false,
        totals: { ...EMPTY_TOTALS },
        records: [],
        insights: [],
      };
    }

    const totals = records.reduce(
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

    return {
      hasConnectedPlatform: connected.length > 0,
      hasData: true,
      totals,
      records,
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
