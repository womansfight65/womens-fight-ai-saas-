import type { Metadata } from 'next';

import { PageHeader } from '@/components/dashboard/page-header';
import { SettingsView } from '@/components/dashboard/settings-view';
import { requireSession } from '@/lib/auth/guards';
import { getStore } from '@/lib/data';
import { usageService } from '@/lib/usage/usage-service';
import { billingService } from '@/lib/billing/billing-service';
import { socialService } from '@/lib/social/social-service';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await requireSession('/dashboard/settings');
  const store = await getStore();

  const [business, brand, usage, billing, connections] = await Promise.all([
    store.getBusinessProfile(session.user.workspace_id),
    store.getBrandProfile(session.user.workspace_id),
    usageService.summary(session.user.workspace_id),
    billingService.state(session.user.workspace_id),
    socialService.listConnections(session.user.workspace_id),
  ]);

  return (
    <>
      <PageHeader title="Settings" description="Your account, your Business Brain, your brand and your limits." />
      <SettingsView
        profile={session.profile}
        workspace={session.workspace}
        business={business}
        brand={brand}
        usage={usage}
        billing={billing}
        connectedCount={connections.filter((c) => c.status === 'connected').length}
      />
    </>
  );
}
