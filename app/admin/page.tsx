import type { Metadata } from 'next';
import { Activity, AlertTriangle, CreditCard, FileText, Send, Users } from 'lucide-react';

import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminStore } from '@/lib/data';
import { integrations } from '@/lib/config/env';
import { PLANS } from '@/lib/config/plans';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminOverviewPage() {
  await requireAdmin();
  const store = await getAdminStore();
  const stats = await store.adminStats();

  const integrationRows = [
    { label: 'Supabase', on: integrations.supabase },
    { label: 'Claude API', on: integrations.claude },
    { label: 'Image provider', on: integrations.imageGeneration },
    { label: 'Video provider', on: integrations.videoGeneration },
    { label: 'Payments', on: integrations.billing },
    { label: 'Social publishing', on: integrations.social },
  ];

  return (
    <>
      <PageHeader title="Overview" description="Live counts from the database. Nothing here is estimated." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={stats.users} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Workspaces" value={stats.workspaces} icon={<CreditCard className="h-4 w-4" />} />
        <StatCard label="Active (7 days)" value={stats.activeUsers7d} icon={<Activity className="h-4 w-4" />} tone="brand" />
        <StatCard label="AI requests" value={stats.aiRequests} icon={<Activity className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Content generated" value={stats.contentItems} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Scheduled" value={stats.scheduled} icon={<Send className="h-4 w-4" />} />
        <StatCard label="Failed jobs" value={stats.failedJobs} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Integrations" description="What is actually configured in this deployment." />
          <CardBody className="space-y-2.5 pt-2">
            {integrationRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-2xl border border-line bg-surface-soft px-4 py-3">
                <span className="text-sm text-ink-soft">{row.label}</span>
                <Badge tone={row.on ? 'success' : 'neutral'}>{row.on ? 'Connected' : 'Not connected'}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Subscriptions by plan" />
          <CardBody className="space-y-2.5 pt-2">
            {PLANS.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between rounded-2xl border border-line bg-surface-soft px-4 py-3">
                <span className="text-sm text-ink-soft">{plan.name}</span>
                <span className="text-sm font-semibold text-ink">
                  {stats.subscriptionsByPlan[plan.id] ?? 0}
                </span>
              </div>
            ))}
            <p className="pt-1 text-xs text-ink-muted">
              Revenue reporting arrives with the payment provider; no figures are shown while billing is
              not connected.
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
