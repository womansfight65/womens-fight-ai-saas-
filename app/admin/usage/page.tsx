import type { Metadata } from 'next';

import { DataTable, type Column } from '@/components/admin/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminStore } from '@/lib/data';
import { currentPeriod } from '@/lib/usage/usage-service';
import { formatDateTime } from '@/lib/utils/date';
import type { UsageRecord, Workspace } from '@/types';

export const metadata: Metadata = { title: 'AI usage · Admin' };

export default async function AdminUsagePage() {
  await requireAdmin();
  const store = await getAdminStore();
  const period = currentPeriod();

  const [records, workspaces] = await Promise.all([
    store.listAllUsage(period, 500),
    store.listWorkspaces(500),
  ]);
  const byId = new Map<string, Workspace>(workspaces.map((w) => [w.id, w]));

  const totals = records.reduce<Record<string, number>>((acc, row) => {
    acc[row.metric] = (acc[row.metric] ?? 0) + row.quantity;
    return acc;
  }, {});

  const columns: Column<UsageRecord>[] = [
    {
      key: 'workspace',
      header: 'Workspace',
      render: (row) => byId.get(row.workspace_id)?.name ?? row.workspace_id.slice(0, 8),
    },
    { key: 'metric', header: 'Metric', render: (row) => row.metric.replace(/_/g, ' ') },
    { key: 'quantity', header: 'Quantity', render: (row) => row.quantity },
    {
      key: 'model',
      header: 'Provider',
      render: (row) => String((row.metadata as Record<string, unknown>)?.provider ?? '—'),
    },
    { key: 'created', header: 'When', render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <>
      <PageHeader title="AI usage" description={`Period ${period}.`} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="AI requests" value={totals.ai_request ?? 0} tone="brand" />
        <StatCard label="Content generations" value={totals.content_generation ?? 0} />
        <StatCard label="Image generations" value={totals.image_generation ?? 0} />
        <StatCard label="Publishing jobs" value={totals.publishing_job ?? 0} />
      </div>
      <DataTable columns={columns} rows={records} empty="No usage recorded this period." />
    </>
  );
}
