import type { Metadata } from 'next';

import { DataTable, type Column } from '@/components/admin/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminStore } from '@/lib/data';
import { getPlan } from '@/lib/config/plans';
import { integrations } from '@/lib/config/env';
import { formatDate } from '@/lib/utils/date';
import type { Subscription, Workspace } from '@/types';

export const metadata: Metadata = { title: 'Subscriptions · Admin' };

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const store = await getAdminStore();
  const [subscriptions, workspaces] = await Promise.all([
    store.listSubscriptions(500),
    store.listWorkspaces(500),
  ]);

  const byId = new Map<string, Workspace>(workspaces.map((w) => [w.id, w]));

  const columns: Column<Subscription>[] = [
    {
      key: 'workspace',
      header: 'Workspace',
      render: (row) => byId.get(row.workspace_id)?.name ?? row.workspace_id.slice(0, 8),
    },
    { key: 'plan', header: 'Plan', render: (row) => getPlan(row.plan_id).name },
    { key: 'interval', header: 'Interval', render: (row) => row.interval },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'active' ? 'success' : row.status === 'past_due' ? 'danger' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'renews',
      header: 'Renews',
      render: (row) => (row.current_period_end ? formatDate(row.current_period_end) : '—'),
    },
  ];

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description={
          integrations.billing
            ? `${subscriptions.length} workspaces with a subscription record.`
            : 'Payments are not connected, so every workspace sits on the free plan with no billing status.'
        }
      />
      <DataTable columns={columns} rows={subscriptions} empty="No subscriptions yet." />
    </>
  );
}
