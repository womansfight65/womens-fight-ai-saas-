import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireSession } from '@/lib/auth/guards';
import { contentIdeaService } from '@/lib/ai/content-idea-service';
import { AIProviderError } from '@/lib/ai/provider';
import { AIValidationError } from '@/lib/ai/ai-service';

const bodySchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(4000),
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
    return NextResponse.json({ error: 'Send a conversation id and a message.' }, { status: 400 });
  }

  try {
    const result = await contentIdeaService.respond({
      workspaceId: session.user.workspace_id,
      userId: session.user.id,
      conversationId: parsed.data.conversationId,
      message: parsed.data.message,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AIValidationError || error instanceof AIProviderError) {
      return NextResponse.json(
        { error: 'The assistant could not answer that. Please try again.' },
        { status: 502 },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
