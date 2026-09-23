import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';

import { ContentCalendar } from '@/components/calendar/content-calendar';
import { PageHeader } from '@/components/dashboard/page-header';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { requireSession } from '@/lib/auth/guards';
import { getStore } from '@/lib/data';

export const metadata: Metadata = { title: 'Calendar' };

export default async function CalendarPage() {
  const session = await requireSession('/dashboard/calendar');
  const store = await getStore();
  const items = await store.listContentItems(session.user.workspace_id);

  return (
    <>
      <PageHeader
        title="Content calendar"
        description="Everything with a date on it. Open a post to edit, move it or schedule it."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="Your calendar is empty."
          description="Create a 30-day plan and the month fills in, or ask the assistant for a single post."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/dashboard/planner">Create my 30-day plan</ButtonLink>
              <ButtonLink href="/dashboard/create" variant="outline">
                Create with AI
              </ButtonLink>
            </div>
          }
        />
      ) : (
        <ContentCalendar items={items} />
      )}
    </>
  );
}
