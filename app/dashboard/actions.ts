'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/lib/auth/guards';
import { contentService, type ContentPatch } from '@/lib/content/content-service';
import { contentGenerationService } from '@/lib/ai/content-generation-service';
import { contentStrategyService } from '@/lib/ai/content-strategy-service';
import { platformAdaptationService } from '@/lib/ai/platform-adaptation-service';
import { businessBrainService } from '@/lib/ai/business-brain-service';
import { mediaService } from '@/lib/media/media-service';
import { notificationService } from '@/lib/notifications/notification-service';
import { socialService } from '@/lib/social/social-service';
import { getStore } from '@/lib/data';
import type { ImageFormat } from '@/lib/media/image-provider';
import type {
  BrandProfile,
  BusinessProfile,
  PlatformId,
  SupportedLanguage,
} from '@/types';
import type { GeneratedContent } from '@/lib/ai/schemas';

export interface ActionResult {
  ok: boolean;
  message?: string;
}

function revalidateContentViews() {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/planner');
  revalidatePath('/dashboard/calendar');
  revalidatePath('/dashboard/library');
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export async function markNotificationsReadAction(): Promise<ActionResult> {
  const session = await requireSession();
  await notificationService.markAllRead(session.user.id);
  revalidatePath('/dashboard');
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export async function updateContentAction(id: string, patch: ContentPatch): Promise<ActionResult> {
  const session = await requireSession();
  const result = await contentService.update(session.user.workspace_id, id, patch);
  revalidateContentViews();
  return result.ok ? { ok: true, message: 'Saved.' } : { ok: false, message: result.error };
}

export async function approveContentAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const result = await contentService.approve(session.user.workspace_id, session.user.id, id);
  revalidateContentViews();
  return result.ok ? { ok: true, message: 'Approved.' } : { ok: false, message: result.error };
}

export async function unapproveContentAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const result = await contentService.unapprove(session.user.workspace_id, id);
  revalidateContentViews();
  return result.ok ? { ok: true, message: 'Sent back for review.' } : { ok: false, message: result.error };
}

export async function scheduleContentAction(
  id: string,
  date?: string,
  time?: string,
): Promise<ActionResult> {
  const session = await requireSession();
  const result = await contentService.schedule({
    workspaceId: session.user.workspace_id,
    userId: session.user.id,
    id,
    date,
    time,
  });
  revalidateContentViews();
  return result.ok ? { ok: true, message: 'Scheduled.' } : { ok: false, message: result.error };
}

export async function rescheduleContentAction(
  id: string,
  date: string,
  time?: string,
): Promise<ActionResult> {
  const session = await requireSession();
  const result = await contentService.reschedule(session.user.workspace_id, id, date, time);
  revalidateContentViews();
  return result.ok ? { ok: true, message: 'Moved.' } : { ok: false, message: result.error };
}

export async function deleteContentAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const result = await contentService.remove(session.user.workspace_id, id);
  revalidateContentViews();
  return result.ok ? { ok: true, message: 'Deleted.' } : { ok: false, message: result.error };
}

export async function regenerateContentAction(
  id: string,
  instruction?: string,
): Promise<ActionResult> {
  const session = await requireSession();
  try {
    const item = await contentGenerationService.regenerate({
      workspaceId: session.user.workspace_id,
      userId: session.user.id,
      itemId: id,
      instruction,
    });
    revalidateContentViews();
    return item
      ? { ok: true, message: 'Regenerated.' }
      : { ok: false, message: 'That content no longer exists.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Regeneration failed.' };
  }
}

export async function adaptContentAction(id: string, platform: PlatformId): Promise<ActionResult> {
  const session = await requireSession();
  const item = await contentService.get(session.user.workspace_id, id);
  if (!item) return { ok: false, message: 'That content no longer exists.' };
  try {
    await platformAdaptationService.adapt({
      workspaceId: session.user.workspace_id,
      userId: session.user.id,
      item,
      platform,
    });
    revalidateContentViews();
    return { ok: true, message: `Rewritten for ${socialService.platformName(platform)}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Adaptation failed.' };
  }
}

export async function saveGeneratedContentAction(
  content: GeneratedContent,
  language: SupportedLanguage,
): Promise<ActionResult & { id?: string }> {
  const session = await requireSession();
  const item = await contentGenerationService.saveAsDraft({
    workspaceId: session.user.workspace_id,
    content,
    language,
  });
  revalidateContentViews();
  return { ok: true, message: 'Saved to your library.', id: item.id };
}

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

export async function generatePlanAction(input?: {
  days?: number;
  startDate?: string;
  language?: SupportedLanguage;
  platforms?: PlatformId[];
}): Promise<ActionResult & { planId?: string }> {
  const session = await requireSession();
  try {
    const result = await contentStrategyService.generatePlan({
      workspaceId: session.user.workspace_id,
      userId: session.user.id,
      ...input,
    });
    revalidateContentViews();
    return { ok: true, message: `${result.items.length} pieces ready.`, planId: result.plan.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'The plan could not be generated.',
    };
  }
}

export async function archivePlanAction(planId: string): Promise<ActionResult> {
  await requireSession();
  await contentStrategyService.archivePlan(planId);
  revalidateContentViews();
  return { ok: true, message: 'Plan archived.' };
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export async function generateImageAction(id: string, format: ImageFormat): Promise<ActionResult> {
  const session = await requireSession();
  const item = await contentService.get(session.user.workspace_id, id);
  if (!item) return { ok: false, message: 'That content no longer exists.' };
  const asset = await mediaService.generateImage({
    workspaceId: session.user.workspace_id,
    item,
    format,
  });
  revalidateContentViews();
  return asset.status === 'ready'
    ? { ok: true, message: 'Image generated.' }
    : { ok: false, message: asset.error_message ?? 'Image generation is not available yet.' };
}

/* ------------------------------------------------------------------ */
/* Business Brain & settings                                           */
/* ------------------------------------------------------------------ */

export async function updateBusinessAction(patch: Partial<BusinessProfile>): Promise<ActionResult> {
  const session = await requireSession();
  await businessBrainService.updateBusiness(session.user.workspace_id, patch);
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  return { ok: true, message: 'Business details saved.' };
}

export async function updateBrandAction(patch: Partial<BrandProfile>): Promise<ActionResult> {
  const session = await requireSession();
  await businessBrainService.updateBrand(session.user.workspace_id, patch);
  revalidatePath('/dashboard/settings');
  return { ok: true, message: 'Brand settings saved.' };
}

export async function updateAccountAction(patch: {
  full_name?: string;
  locale?: SupportedLanguage;
}): Promise<ActionResult> {
  const session = await requireSession();
  const store = await getStore();
  await store.updateProfile(session.user.id, patch);
  revalidatePath('/dashboard/settings');
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Account updated.' };
}

export async function updateWorkspaceAction(patch: { name?: string; timezone?: string }): Promise<ActionResult> {
  const session = await requireSession();
  const store = await getStore();
  await store.updateWorkspace(session.user.workspace_id, patch);
  revalidatePath('/dashboard/settings');
  return { ok: true, message: 'Workspace updated.' };
}

/* ------------------------------------------------------------------ */
/* Social accounts                                                     */
/* ------------------------------------------------------------------ */

export async function connectSocialAction(platform: PlatformId): Promise<ActionResult> {
  const session = await requireSession();
  const result = await socialService.startConnection(
    session.user.workspace_id,
    platform,
    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/social/callback/${platform}`,
  );
  revalidatePath('/dashboard/social');
  return result.ok
    ? { ok: true, message: 'Redirecting…' }
    : { ok: false, message: result.error ?? 'Not available yet.' };
}

export async function disconnectSocialAction(platform: PlatformId): Promise<ActionResult> {
  const session = await requireSession();
  await socialService.disconnect(session.user.workspace_id, platform);
  revalidatePath('/dashboard/social');
  return { ok: true, message: 'Disconnected.' };
}
