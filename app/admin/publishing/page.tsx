import type { Metadata } from 'next';

import { DataTable, type Column } from '@/components/admin/data-table';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminStore } from '@/lib/data';
import { formatDateTime } from '@/lib/utils/date';
import { PLATFORMS } from '@/lib/config/platforms';
import type { PublishingJob, PublishingJobStatus, Workspace } from '@/types';

export const metadata: Metadata = { title: 'Publishing · Admin' };

const TONE: Record<PublishingJobStatus, BadgeTone> = {
  queued: 'info',
  publishing: 'warning',
  published: 'success',
  failed: 'danger',
  retrying: 'warning',
  blocked: 'neutral',
};

export default async function AdminPublishingPage() {
  await requireAdmin();
  const store = await getAdminStore();
  const [jobs, workspaces] = await Promise.all([
    store.listPublishingJobs(undefined, 200),
    store.listWorkspaces(500),
  ]);
  const byId = new Map<string, Workspace>(workspaces.map((w) => [w.id, w]));

  const columns: Column<PublishingJob>[] = [
    {
      key: 'workspace',
      header: 'Workspace',
      render: (row) => byId.get(row.workspace_id)?.name ?? row.workspace_id.slice(0, 8),
    },
    { key: 'platform', header: 'Platform', render: (row) => PLATFORMS[row.platform].name },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={TONE[row.status]}>{row.status}</Badge> },
    { key: 'attempts', header: 'Attempts', render: (row) => row.attempt_count },
    { key: 'run_after', header: 'Runs after', render: (row) => formatDateTime(row.run_after) },
    {
      key: 'error',
      header: 'Last error',
      render: (row) => (row.last_error ? <span className="text-state-danger">{row.last_error}</span> : '—'),
    },
  ];

  return (
    <>
      <PageHeader title="Publishing jobs" description="The queue the worker reads from." />

      <Card className="mb-6">
        <CardHeader title="The worker" description="Scheduling does not depend on anyone's browser." />
        <CardBody className="space-y-2 pt-2 text-sm text-ink-muted">
          <p>
            Due jobs are processed by <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">POST /api/scheduler/run</code>,
            protected by <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">SCHEDULER_WORKER_SECRET</code>.
            Point a cron job at it every few minutes.
          </p>
          <p>
            Failed jobs retry with backoff up to three attempts. A job is only ever marked published when a
            platform API returns a post id.
          </p>
        </CardBody>
      </Card>

      <DataTable columns={columns} rows={jobs} empty="No publishing jobs yet." />
    </>
  );
}
