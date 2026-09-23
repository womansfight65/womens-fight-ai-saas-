'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/lib/auth/guards';
import { onboardingService } from '@/lib/ai/onboarding-service';

export async function completeOnboardingAction(): Promise<{ ok: boolean }> {
  const session = await requireSession('/onboarding');
  await onboardingService.complete({
    workspaceId: session.user.workspace_id,
    userId: session.user.id,
  });
  revalidatePath('/', 'layout');
  return { ok: true };
}
