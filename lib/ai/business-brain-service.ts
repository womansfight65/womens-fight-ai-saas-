import 'server-only';

import { getStore } from '@/lib/data';
import type { BusinessBrain, BusinessProfile, BrandProfile, SupportedLanguage, UUID } from '@/types';
import type { OnboardingTurn } from './schemas';

/** Fields that together mean "we know enough to plan a month". */
const WEIGHTED_FIELDS: Array<{ key: keyof BusinessProfile; weight: number }> = [
  { key: 'business_name', weight: 10 },
  { key: 'industry', weight: 10 },
  { key: 'description', weight: 15 },
  { key: 'products', weight: 10 },
  { key: 'target_audience', weight: 15 },
  { key: 'audience_problems', weight: 10 },
  { key: 'business_goals', weight: 5 },
  { key: 'content_goals', weight: 10 },
  { key: 'preferred_platforms', weight: 10 },
  { key: 'posting_frequency', weight: 5 },
];

function filled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}

export function computeCompleteness(business: BusinessProfile | null): number {
  if (!business) return 0;
  const total = WEIGHTED_FIELDS.reduce((sum, f) => sum + f.weight, 0);
  const earned = WEIGHTED_FIELDS.reduce(
    (sum, f) => (filled(business[f.key]) ? sum + f.weight : sum),
    0,
  );
  return Math.round((earned / total) * 100);
}

function mergeList(existing: string[] | null | undefined, incoming: unknown): string[] | undefined {
  if (!Array.isArray(incoming)) return undefined;
  const clean = incoming.map((v) => String(v).trim()).filter(Boolean);
  if (!clean.length) return undefined;
  const merged = [...(existing ?? []), ...clean];
  return merged.filter((v, i) => merged.indexOf(v) === i).slice(0, 25);
}

/**
 * Owns the Business Brain: the persistent understanding of a business that
 * every other AI call reads, so the user never explains themselves twice.
 */
class BusinessBrainService {
  async load(workspaceId: UUID): Promise<BusinessBrain> {
    const store = await getStore();
    const [business, brand, recent] = await Promise.all([
      store.getBusinessProfile(workspaceId),
      store.getBrandProfile(workspaceId),
      store.listContentItems(workspaceId, { limit: 40 }),
    ]);

    return {
      business,
      brand,
      history: {
        recent_topics: recent.map((item) => item.topic).slice(-20),
        edited_examples: recent
          .filter((item) => item.status === 'approved' || item.status === 'published')
          .slice(-5)
          .map((item) => item.caption.slice(0, 240)),
        feedback_notes: [],
      },
    };
  }

  /** Applies one onboarding turn's extraction to the stored brain. */
  async applyExtraction(workspaceId: UUID, turn: OnboardingTurn): Promise<BusinessProfile> {
    const store = await getStore();
    const current = await store.getBusinessProfile(workspaceId);
    const b = turn.business ?? {};

    const patch: Partial<BusinessProfile> = {};
    if (filled(b.business_name)) patch.business_name = String(b.business_name);
    if (filled(b.industry)) patch.industry = String(b.industry);
    if (filled(b.description)) patch.description = String(b.description);
    if (filled(b.location)) patch.location = String(b.location);
    if (filled(b.target_audience)) patch.target_audience = String(b.target_audience);
    if (filled(b.posting_frequency)) patch.posting_frequency = String(b.posting_frequency);

    const products = mergeList(current?.products, b.products);
    if (products) patch.products = products;
    const services = mergeList(current?.services, b.services);
    if (services) patch.services = services;
    const problems = mergeList(current?.audience_problems, b.audience_problems);
    if (problems) patch.audience_problems = problems;
    const needs = mergeList(current?.audience_needs, b.audience_needs);
    if (needs) patch.audience_needs = needs;
    const interests = mergeList(current?.audience_interests, b.audience_interests);
    if (interests) patch.audience_interests = interests;
    const businessGoals = mergeList(current?.business_goals, b.business_goals);
    if (businessGoals) patch.business_goals = businessGoals;
    const contentGoals = mergeList(current?.content_goals, b.content_goals);
    if (contentGoals) patch.content_goals = contentGoals;
    if (Array.isArray(b.preferred_platforms) && b.preferred_platforms.length) {
      patch.preferred_platforms = b.preferred_platforms;
    }

    const merged = { ...(current ?? {}), ...patch } as BusinessProfile;
    patch.completeness = computeCompleteness(merged);

    const saved = await store.upsertBusinessProfile(workspaceId, patch);

    const brandPatch: Partial<BrandProfile> = {};
    const br = turn.brand ?? {};
    if (filled(br.brand_voice)) brandPatch.brand_voice = String(br.brand_voice);
    if (filled(br.style_notes)) brandPatch.style_notes = String(br.style_notes);
    if (br.preferred_language) brandPatch.preferred_language = br.preferred_language as SupportedLanguage;
    const personality = mergeList((await store.getBrandProfile(workspaceId))?.personality, br.personality);
    if (personality) brandPatch.personality = personality;
    if (Object.keys(brandPatch).length) await store.upsertBrandProfile(workspaceId, brandPatch);

    return saved;
  }

  async updateBusiness(workspaceId: UUID, patch: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const store = await getStore();
    const current = await store.getBusinessProfile(workspaceId);
    const merged = { ...(current ?? {}), ...patch } as BusinessProfile;
    return store.upsertBusinessProfile(workspaceId, {
      ...patch,
      completeness: computeCompleteness(merged),
    });
  }

  async updateBrand(workspaceId: UUID, patch: Partial<BrandProfile>): Promise<BrandProfile> {
    const store = await getStore();
    return store.upsertBrandProfile(workspaceId, patch);
  }

  /** True when there is enough to build a plan worth reading. */
  isReady(business: BusinessProfile | null): boolean {
    return computeCompleteness(business) >= 55;
  }
}

export const businessBrainService = new BusinessBrainService();
