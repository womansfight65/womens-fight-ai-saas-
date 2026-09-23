import type { Metadata } from 'next';
import { Library } from 'lucide-react';

import { ContentBrowser } from '@/components/content/content-browser';
import { PageHeader } from '@/components/dashboard/page-header';
import { ButtonLink } from '@/components/ui/button';
import { requireSession } from '@/lib/auth/guards';
import { getStore } from '@/lib/data';

export const metadata: Metadata = { title: 'Library' };

export default async function LibraryPage() {
  const session = await requireSession('/dashboard/library');
  const store = await getStore();
  const items = await store.listContentItems(session.user.workspace_id);

  return (
    <>
      <PageHeader
        title="Content library"
        description="Every piece of content you have generated, in one searchable place."
        action={
          <ButtonLink href="/dashboard/create" icon={<Library className="h-4 w-4" />}>
            Create with AI
          </ButtonLink>
        }
      />

      <ContentBrowser
        items={items}
        emptyTitle="Your library is empty."
        emptyDescription="Generate a 30-day plan, or ask the assistant for a single post to get started."
        emptyAction={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/dashboard/planner">Create my 30-day plan</ButtonLink>
            <ButtonLink href="/dashboard/create" variant="outline">
              Create with AI
            </ButtonLink>
          </div>
        }
      />
    </>
  );
}
