import type { Metadata } from 'next';

import { CreateStudio } from '@/components/content/create-studio';
import { PageHeader } from '@/components/dashboard/page-header';
import { requireSession } from '@/lib/auth/guards';
import { aiService } from '@/lib/ai/ai-service';

export const metadata: Metadata = { title: 'Create with AI' };

export default async function CreatePage() {
  await requireSession('/dashboard/create');

  return (
    <>
      <PageHeader
        title="Create with AI"
        description="One line is enough — the assistant already knows your business, your audience and how you sound."
      />
      <CreateStudio isMock={aiService.isMock} />
    </>
  );
}
