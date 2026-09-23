import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireSession } from '@/lib/auth/guards';
import { contentStrategyService } from '@/lib/ai/content-strategy-service';
import { businessBrainService } from '@/lib/ai/business-brain-service';
import { getStore } from '@/lib/data';

const bodySchema = z.object({
  days: z.number().int().min(1).max(31).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  language: z.enum(['en', 'bn', 'banglish']).optional(),
  platforms: z.array(z.enum(['facebook', 'instagram', 'youtube', 'tiktok', 'x', 'linkedin'])).optional(),
});

export async function POST(request: Request) {
  const session = await requireSession();

  let payload: unknown = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }
  const parsed = bodySchema.safeParse(payload ?? {});
  const input = parsed.success ? parsed.data : {};

  const store = await getStore();
  const business = await store.getBusinessProfile(session.user.workspace_id);
  if (!businessBrainService.isReady(business)) {
    return NextResponse.json(
      { error: 'Finish the onboarding conversation first — the plan is written from your Business Brain.' },
      { status: 409 },
    );
  }

  try {
    const result = await contentStrategyService.generatePlan({
      workspaceId: session.user.workspace_id,
      userId: session.user.id,
      ...input,
    });
    return NextResponse.json({
      planId: result.plan.id,
      count: result.items.length,
      isMock: result.isMock,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'The plan could not be generated. Please try again.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
