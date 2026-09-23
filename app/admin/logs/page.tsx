import type { Metadata } from 'next';

import { DataTable, type Column } from '@/components/admin/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminStore } from '@/lib/data';
import { formatDateTime } from '@/lib/utils/date';
import type { LogLevel, SystemLog } from '@/types';

export const metadata: Metadata = { title: 'System logs · Admin' };

const TONE: Record<LogLevel, BadgeTone> = {
  debug: 'neutral',
  info: 'info',
  warn: 'warning',
  error: 'danger',
};

export default async function AdminLogsPage() {
  await requireAdmin();
  const store = await getAdminStore();
  const logs = await store.listLogs(200);

  const columns: Column<SystemLog>[] = [
    { key: 'level', header: 'Level', render: (row) => <Badge tone={TONE[row.level]}>{row.level}</Badge> },
    { key: 'scope', header: 'Scope', render: (row) => row.scope },
    { key: 'message', header: 'Message', render: (row) => <span className="text-ink">{row.message}</span> },
    {
      key: 'metadata',
      header: 'Detail',
      render: (row) => (
        <code className="block max-w-[280px] truncate text-xs text-ink-muted">
          {JSON.stringify(row.metadata)}
        </code>
      ),
    },
    { key: 'created', header: 'When', render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <>
      <PageHeader
        title="System logs"
        description="Credentials are stripped before anything is written, so these are safe to read."
      />
      <DataTable columns={columns} rows={logs} empty="No log entries yet." />
    </>
  );
}
