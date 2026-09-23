import type { Metadata } from 'next';

import { IdeaChat } from '@/components/ai/idea-chat';
import { PageHeader } from '@/components/dashboard/page-header';
import { requireSession } from '@/lib/auth/guards';
import { contentIdeaService } from '@/lib/ai/content-idea-service';

export const metadata: Metadata = { title: 'Create with AI' };

export default async function CreatePage() {
  const session = await requireSession('/dashboard/create');

  const ideaState = await contentIdeaService.start({
    workspaceId: session.user.workspace_id,
    userId: session.user.id,
  });

  return (
    <>
      <PageHeader
        title="Create with AI"
        description="Talk it through — the assistant remembers everything you share and only creates posts when you tell it to."
      />
      <IdeaChat conversationId={ideaState.conversationId} initialMessages={ideaState.messages} />
    </>
  );
}
