'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button, ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { PLATFORM_LIST } from '@/lib/config/platforms';
import { LANGUAGE_LABELS } from '@/lib/ai/language';
import type { UsageSummary } from '@/lib/usage/usage-service';
import type { BillingState } from '@/lib/billing/billing-service';
import type {
  BrandProfile,
  BusinessProfile,
  PlatformId,
  Profile,
  SupportedLanguage,
  Workspace,
} from '@/types';
import {
  updateAccountAction,
  updateBrandAction,
  updateBusinessAction,
  updateWorkspaceAction,
} from '@/app/dashboard/actions';

type TabId = 'account' | 'business' | 'brand' | 'social' | 'notifications' | 'subscription' | 'usage';

const TABS = [
  { id: 'account' as const, label: 'Account' },
  { id: 'business' as const, label: 'Business' },
  { id: 'brand' as const, label: 'Brand' },
  { id: 'social' as const, label: 'Social' },
  { id: 'notifications' as const, label: 'Notifications' },
  { id: 'subscription' as const, label: 'Subscription' },
  { id: 'usage' as const, label: 'Usage' },
];

function list(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function SettingsView({
  profile,
  workspace,
  business,
  brand,
  usage,
  billing,
  connectedCount,
}: {
  profile: Profile;
  workspace: Workspace;
  business: BusinessProfile | null;
  brand: BrandProfile | null;
  usage: UsageSummary;
  billing: BillingState;
  connectedCount: number;
}) {
  const [tab, setTab] = useState<TabId>('account');
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      toast.push(result.message ?? (result.ok ? 'Saved.' : 'That did not work.'), result.ok ? 'success' : 'error');
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'account' ? (
        <Card>
          <CardHeader title="Account" description="How you appear inside the app." />
          <CardBody>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                run(() =>
                  updateAccountAction({
                    full_name: String(data.get('full_name') ?? ''),
                    locale: String(data.get('locale') ?? 'en') as SupportedLanguage,
                  }),
                );
              }}
            >
              <Input label="Full name" name="full_name" defaultValue={profile.full_name ?? ''} />
              <Input label="Email" value={profile.email} disabled hint="Email changes go through your auth provider." />
              <Select label="Interface language preference" name="locale" defaultValue={profile.locale}>
                {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((code) => (
                  <option key={code} value={code}>
                    {LANGUAGE_LABELS[code]}
                  </option>
                ))}
              </Select>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={pending}>Save account</Button>
                <ButtonLink href="/forgot-password" variant="ghost" size="sm">
                  Change password
                </ButtonLink>
              </div>
            </form>

            <div className="mt-8 border-t border-line pt-6">
              <h3 className="text-sm font-semibold text-ink">Workspace</h3>
              <form
                className="mt-4 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  run(() =>
                    updateWorkspaceAction({
                      name: String(data.get('name') ?? ''),
                      timezone: String(data.get('timezone') ?? ''),
                    }),
                  );
                }}
              >
                <Input label="Workspace name" name="name" defaultValue={workspace.name} />
                <Input
                  label="Timezone"
                  name="timezone"
                  defaultValue={workspace.timezone}
                  hint="Used when a scheduled post's time is resolved into a real instant."
                />
                <Button type="submit" variant="outline" loading={pending}>Save workspace</Button>
              </form>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'business' ? (
        <Card>
          <CardHeader
            title="Business"
            description="This is your Business Brain. Every generation reads from it."
            action={<Badge tone="brand">{business?.completeness ?? 0}% complete</Badge>}
          />
          <CardBody>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                run(() =>
                  updateBusinessAction({
                    business_name: String(data.get('business_name') ?? '') || null,
                    industry: String(data.get('industry') ?? '') || null,
                    description: String(data.get('description') ?? '') || null,
                    location: String(data.get('location') ?? '') || null,
                    target_audience: String(data.get('target_audience') ?? '') || null,
                    products: list(String(data.get('products') ?? '')),
                    services: list(String(data.get('services') ?? '')),
                    audience_problems: list(String(data.get('audience_problems') ?? '')),
                    business_goals: list(String(data.get('business_goals') ?? '')),
                    content_goals: list(String(data.get('content_goals') ?? '')),
                    posting_frequency: String(data.get('posting_frequency') ?? '') || null,
                    preferred_platforms: data.getAll('preferred_platforms').map(String) as PlatformId[],
                  }),
                );
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Business name" name="business_name" defaultValue={business?.business_name ?? ''} />
                <Input label="Industry" name="industry" defaultValue={business?.industry ?? ''} />
              </div>
              <Textarea label="What you do" name="description" defaultValue={business?.description ?? ''} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Location" name="location" defaultValue={business?.location ?? ''} />
                <Input label="Posting frequency" name="posting_frequency" defaultValue={business?.posting_frequency ?? ''} />
              </div>
              <Textarea label="Target audience" name="target_audience" defaultValue={business?.target_audience ?? ''} className="min-h-[90px]" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Textarea label="Products" name="products" defaultValue={(business?.products ?? []).join(', ')} hint="Comma separated." className="min-h-[90px]" />
                <Textarea label="Services" name="services" defaultValue={(business?.services ?? []).join(', ')} hint="Comma separated." className="min-h-[90px]" />
              </div>
              <Textarea label="Audience problems" name="audience_problems" defaultValue={(business?.audience_problems ?? []).join(', ')} hint="Comma separated." className="min-h-[90px]" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Textarea label="Business goals" name="business_goals" defaultValue={(business?.business_goals ?? []).join(', ')} hint="Comma separated." className="min-h-[90px]" />
                <Textarea label="Content goals" name="content_goals" defaultValue={(business?.content_goals ?? []).join(', ')} hint="Comma separated." className="min-h-[90px]" />
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-ink-soft">Preferred platforms</legend>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_LIST.map((platform) => (
                    <label
                      key={platform.id}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-ink-soft transition-colors hover:border-brand-purple/40 has-[:checked]:border-brand-purple/50 has-[:checked]:bg-brand-purple/5 has-[:checked]:text-ink"
                    >
                      <input
                        type="checkbox"
                        name="preferred_platforms"
                        value={platform.id}
                        defaultChecked={business?.preferred_platforms?.includes(platform.id)}
                        className="h-4 w-4 rounded border-line-strong text-brand-purple focus:ring-brand-purple/40"
                      />
                      {platform.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Button type="submit" loading={pending}>Save business</Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'brand' ? (
        <Card>
          <CardHeader title="Brand" description="How your content should sound and look." />
          <CardBody>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                run(() =>
                  updateBrandAction({
                    brand_voice: String(data.get('brand_voice') ?? '') || null,
                    style_notes: String(data.get('style_notes') ?? '') || null,
                    personality: list(String(data.get('personality') ?? '')),
                    preferred_language: String(data.get('preferred_language') ?? 'en') as SupportedLanguage,
                    primary_color: String(data.get('primary_color') ?? '') || null,
                    secondary_color: String(data.get('secondary_color') ?? '') || null,
                    logo_url: String(data.get('logo_url') ?? '') || null,
                  }),
                );
              }}
            >
              <Textarea label="Brand voice" name="brand_voice" defaultValue={brand?.brand_voice ?? ''} className="min-h-[90px]" />
              <Input label="Personality" name="personality" defaultValue={(brand?.personality ?? []).join(', ')} hint="Comma separated, e.g. warm, practical, direct." />
              <Textarea label="Style notes" name="style_notes" defaultValue={brand?.style_notes ?? ''} className="min-h-[90px]" hint="Anything the AI should always or never do." />
              <Select
                label="Content language"
                name="preferred_language"
                defaultValue={brand?.preferred_language ?? 'en'}
                hint="The language your posts are written in. The chat still follows whatever you type."
              >
                {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((code) => (
                  <option key={code} value={code}>
                    {LANGUAGE_LABELS[code]}
                  </option>
                ))}
              </Select>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Primary colour" name="primary_color" defaultValue={brand?.primary_color ?? ''} placeholder="#EC4899" />
                <Input label="Secondary colour" name="secondary_color" defaultValue={brand?.secondary_color ?? ''} placeholder="#3B82F6" />
              </div>
              <Input label="Logo URL" name="logo_url" defaultValue={brand?.logo_url ?? ''} hint="Uploads arrive with Supabase Storage." />
              <Button type="submit" loading={pending}>Save brand</Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'social' ? (
        <Card>
          <CardHeader title="Social accounts" description={`${connectedCount} of ${PLATFORM_LIST.length} connected.`} />
          <CardBody>
            <p className="text-sm text-ink-muted">
              Connections are managed on their own page, where each platform shows its real state.
            </p>
            <ButtonLink href="/dashboard/social" className="mt-4">
              Open social accounts
            </ButtonLink>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'notifications' ? (
        <Card>
          <CardHeader title="Notifications" description="In-app notifications are on for the events below." />
          <CardBody className="space-y-2.5">
            {[
              'Business profile ready',
              '30-day plan ready',
              'Content generated',
              'Content approved',
              'Content scheduled',
              'Content published',
              'Publishing failed',
              'Usage limit warning',
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-line bg-surface-soft px-4 py-3">
                <span className="text-sm text-ink-soft">{item}</span>
                <Badge tone="success">In-app</Badge>
              </div>
            ))}
            <p className="pt-2 text-xs text-ink-muted">
              Email and push notifications arrive with a mail provider; the service is already in place for them.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'subscription' ? (
        <Card>
          <CardHeader
            title="Subscription"
            description={`You are on the ${billing.plan.name} plan.`}
            action={
              <Badge tone={billing.paymentsConnected ? 'success' : 'warning'}>
                {billing.paymentsConnected ? 'Payments connected' : 'Payments not connected'}
              </Badge>
            }
          />
          <CardBody className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface-soft p-5">
              <p className="text-sm font-semibold text-ink">{billing.plan.name}</p>
              <p className="mt-1 text-sm text-ink-muted">{billing.plan.tagline}</p>
              <p className="mt-3 text-sm text-ink-soft">
                Status: {billing.subscription?.status ?? 'not_configured'}
                {billing.subscription?.current_period_end
                  ? ` · renews ${new Date(billing.subscription.current_period_end).toLocaleDateString()}`
                  : ''}
              </p>
            </div>

            {!billing.paymentsConnected ? (
              <p className="text-sm text-ink-muted">
                No payment provider is configured in this build, so there is no checkout to open. Plans and
                limits are live and enforced; billing switches on with a Stripe key.
              </p>
            ) : null}

            <Link href="/pricing" className="text-sm font-medium text-brand-purple hover:underline">
              Compare plans →
            </Link>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'usage' ? (
        <Card>
          <CardHeader title="Usage" description={`Period ${usage.period} · ${usage.planId} plan limits.`} />
          <CardBody className="space-y-5">
            <Progress
              value={(usage.used.ai_request / Math.max(usage.limits.ai_generations_per_month, 1)) * 100}
              label={`AI requests — ${usage.used.ai_request} of ${usage.limits.ai_generations_per_month}`}
            />
            <Progress
              value={
                usage.limits.image_generations_per_month
                  ? (usage.used.image_generation / usage.limits.image_generations_per_month) * 100
                  : 0
              }
              label={`Image generations — ${usage.used.image_generation} of ${usage.limits.image_generations_per_month}`}
              tone="neutral"
            />
            <Progress
              value={
                usage.limits.scheduled_posts_per_month
                  ? (usage.used.publishing_job / usage.limits.scheduled_posts_per_month) * 100
                  : 0
              }
              label={`Publishing jobs — ${usage.used.publishing_job} of ${usage.limits.scheduled_posts_per_month}`}
              tone="neutral"
            />
            <p className="text-xs text-ink-muted">Usage resets at the start of each calendar month.</p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
