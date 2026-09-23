import type { Metadata } from 'next';

import { DataTable, type Column } from '@/components/admin/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminStore } from '@/lib/data';
import { formatDate } from '@/lib/utils/date';
import { PLATFORMS } from '@/lib/config/platforms';
import { truncate } from '@/lib/utils/text';
import type { ContentItem, Workspace } from '@/types';

export const metadata: Metadata = { title: 'Content · Admin' };

export default async function AdminContentPage() {
  await requireAdmin();
  const store = await getAdminStore();

  const workspaces = await store.listWorkspaces(200);
  const byId = new Map<string, Workspace>(workspaces.map((w) => [w.id, w]));

  const perWorkspace = await Promise.all(
    workspaces.map((workspace) => store.listContentItems(workspace.id, { limit: 50 })),
  );
  const items = perWorkspace.flat().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 200);
  const total = await store.countAllContent();

  const columns: Column<ContentItem>[] = [
    {
      key: 'topic',
      header: 'Topic',
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{truncate(row.topic, 60)}</p>
          <p className="text-xs text-ink-muted">{byId.get(row.workspace_id)?.name ?? '—'}</p>
        </div>
      ),
    },
    { key: 'platform', header: 'Platform', render: (row) => PLATFORMS[row.platform].name },
    { key: 'objective', header: 'Objective', render: (row) => row.objective },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'date', header: 'Scheduled', render: (row) => formatDate(row.scheduled_date) },
  ];

  return (
    <>
      <PageHeader title="Content" description="The most recent content across every workspace." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total content" value={total} />
        <StatCard label="Workspaces" value={workspaces.length} />
        <StatCard label="Shown here" value={items.length} tone="brand" />
      </div>
      <DataTable columns={columns} rows={items} empty="No content generated yet." />
    </>
  );
}
