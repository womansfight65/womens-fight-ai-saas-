import type { Metadata } from 'next';

import { CreateTabs } from '@/components/content/create-tabs';
import { PageHeader } from '@/components/dashboard/page-header';
import { requireSession } from '@/lib/auth/guards';
import { aiService } from '@/lib/ai/ai-service';
import { contentIdeaService } from '@/lib/ai/content-idea-service';

export const metadata: Metadata = { title: 'Create with AI' };

export default async function CreatePage() {
  const session = await requireSession('/dashboard/create');

  const ideaState = await contentIdeaService.start({
    workspaceId: session.user.workspace_id,
    userId: session.user.id,
    language: session.profile.locale,
  });

  return (
    <>
      <PageHeader
        title="Create with AI"
        description="One line is enough — the assistant already knows your business, your audience and how you sound."
      />
      <CreateTabs
        isMock={aiService.isMock}
        conversationId={ideaState.conversationId}
        initialMessages={ideaState.messages}
      />
    </>
  );
}
