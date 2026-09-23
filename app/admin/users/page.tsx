import type { Metadata } from 'next';

import { DataTable, type Column } from '@/components/admin/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminStore } from '@/lib/data';
import { formatDate } from '@/lib/utils/date';
import type { Profile } from '@/types';

export const metadata: Metadata = { title: 'Users · Admin' };

export default async function AdminUsersPage() {
  await requireAdmin();
  const store = await getAdminStore();
  const [users, workspaces] = await Promise.all([store.listProfiles(200), store.listWorkspaces(500)]);

  const workspaceCount = new Map<string, number>();
  for (const workspace of workspaces) {
    workspaceCount.set(workspace.owner_id, (workspaceCount.get(workspace.owner_id) ?? 0) + 1);
  }

  const columns: Column<Profile>[] = [
    {
      key: 'name',
      header: 'User',
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{row.full_name ?? '—'}</p>
          <p className="text-xs text-ink-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge tone={row.role === 'admin' ? 'brand' : 'neutral'}>{row.role}</Badge>,
    },
    {
      key: 'onboarding',
      header: 'Onboarding',
      render: (row) => (
        <Badge tone={row.onboarding_completed ? 'success' : 'warning'}>
          {row.onboarding_completed ? 'Complete' : 'In progress'}
        </Badge>
      ),
    },
    { key: 'workspaces', header: 'Workspaces', render: (row) => workspaceCount.get(row.id) ?? 0 },
    { key: 'locale', header: 'Language', render: (row) => row.locale },
    { key: 'created', header: 'Joined', render: (row) => formatDate(row.created_at) },
  ];

  return (
    <>
      <PageHeader title="Users" description={`${users.length} accounts.`} />
      <DataTable columns={columns} rows={users} empty="No users yet." />
    </>
  );
}
