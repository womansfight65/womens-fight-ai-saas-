import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireSession } from '@/lib/auth/guards';
import { contentGenerationService } from '@/lib/ai/content-generation-service';

const bodySchema = z.object({
  request: z.string().min(2).max(2000),
  language: z.enum(['en', 'bn', 'banglish']).optional(),
});

export async function POST(request: Request) {
  const session = await requireSession();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Tell the assistant what you want.' }, { status: 400 });
  }

  try {
    const result = await contentGenerationService.generate({
      workspaceId: session.user.workspace_id,
      userId: session.user.id,
      request: parsed.data.request,
      language: parsed.data.language,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
